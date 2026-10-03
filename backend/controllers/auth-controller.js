import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user.js";
import Verification from "../models/verification.js";
import { sendEmail } from "../libs/send-email.js";
import { env } from "../src/config/env.js";
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "../src/utils/errors.js";
import { asyncHandler } from "../src/utils/async-handler.js";

/**
 * Register a new user
 * POST /api-v1/auth/register
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { email, name, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError("Email address already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    email,
    password: hashPassword,
    name,
  });

  const verificationToken = jwt.sign(
    { userId: newUser._id, purpose: "email-verification" },
    env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Clean up any stale tokens and create new verification record
  await Verification.deleteMany({ userId: newUser._id });
  await Verification.create({
    userId: newUser._id,
    token: verificationToken,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });

  const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`;
  const emailSubject = "Verify your email";

  const isEmailSent = await sendEmail(email, emailSubject, emailBody);
  if (!isEmailSent) {
    throw new AppError("Failed to send verification email", 500);
  }

  res.status(201).json({
    message: "Verification email sent to your email. Please check and verify your account.",
  });
});

/**
 * Authenticate user and issue session token
 * POST /api-v1/auth/login
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new BadRequestError("Invalid email or password");
  }

  // Handle unverified email accounts
  if (!user.isEmailVerified) {
    const existingVerification = await Verification.findOne({
      userId: user._id,
    });

    if (existingVerification && existingVerification.expiresAt > new Date()) {
      throw new BadRequestError(
        "Email not verified. Please check your email for the verification link."
      );
    }

    // Purge expired verification tokens
    await Verification.deleteMany({ userId: user._id });

    const verificationToken = jwt.sign(
      { userId: user._id, purpose: "email-verification" },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await Verification.create({
      userId: user._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`;
    const emailSubject = "Verify your email";

    const isEmailSent = await sendEmail(email, emailSubject, emailBody);
    if (!isEmailSent) {
      throw new AppError("Failed to send verification email", 500);
    }

    // Stop execution and return verification notice; DO NOT log in unverified users!
    return res.status(200).json({
      message:
        "Verification email sent to your email. Please check and verify your account.",
    });
  }

  // Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new BadRequestError("Invalid email or password");
  }

  const token = jwt.sign(
    { userId: user._id, purpose: "login" },
    env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  user.lastLogin = new Date();
  await user.save();

  // Strip password hash and internal fields from returned user data
  const userData = user.toObject();
  delete userData.password;
  delete userData.__v;

  res.status(200).json({
    message: "Login successful",
    token,
    user: userData,
  });
});

/**
 * Verify user email via token
 * POST /api-v1/auth/verify-email
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Verification token has expired. Please request a new one.");
    }
    throw new UnauthorizedError("Invalid verification token.");
  }

  const { userId, purpose } = payload;
  if (purpose !== "email-verification") {
    throw new UnauthorizedError("Invalid token purpose");
  }

  // Single-use token verification against database
  const verification = await Verification.findOne({
    userId,
    token,
  });

  if (!verification) {
    throw new UnauthorizedError("Invalid or already used verification token");
  }

  if (verification.expiresAt < new Date()) {
    await Verification.findByIdAndDelete(verification._id);
    throw new UnauthorizedError("Verification token has expired");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User account not found");
  }

  if (user.isEmailVerified) {
    await Verification.deleteMany({ userId });
    throw new BadRequestError("Email is already verified");
  }

  user.isEmailVerified = true;
  await user.save();

  // Single-use guarantee: Invalidate all verification tokens for this user
  await Verification.deleteMany({ userId });

  res.status(200).json({ message: "Email verified successfully" });
});

/**
 * Request password reset email
 * POST /api-v1/auth/reset-password-request
 */
export const resetPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("No account found with this email address");
  }

  if (!user.isEmailVerified) {
    throw new BadRequestError("Please verify your email first before resetting password");
  }

  const existingVerification = await Verification.findOne({
    userId: user._id,
  });

  if (existingVerification && existingVerification.expiresAt > new Date()) {
    throw new BadRequestError(
      "A reset password link was already sent. Please check your email or wait for it to expire."
    );
  }

  // Clear stale tokens
  await Verification.deleteMany({ userId: user._id });

  const resetPasswordToken = jwt.sign(
    { userId: user._id, purpose: "reset-password" },
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  await Verification.create({
    userId: user._id,
    token: resetPasswordToken,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });

  const resetPasswordLink = `${env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
  const emailBody = `<p>Click <a href="${resetPasswordLink}">here</a> to reset your password</p>`;
  const emailSubject = "Reset your password";

  const isEmailSent = await sendEmail(email, emailSubject, emailBody);
  if (!isEmailSent) {
    throw new AppError("Failed to send reset password email", 500);
  }

  res.status(200).json({ message: "Reset password email sent" });
});

/**
 * Verify reset token and set new password
 * POST /api-v1/auth/reset-password
 */
export const verifyResetPasswordTokenAndResetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Password reset token has expired. Please request a new one.");
    }
    throw new UnauthorizedError("Invalid password reset token.");
  }

  const { userId, purpose } = payload;
  if (purpose !== "reset-password") {
    throw new UnauthorizedError("Invalid token purpose");
  }

  // Single-use check against stored verification record
  const verification = await Verification.findOne({
    userId,
    token,
  });

  if (!verification) {
    throw new UnauthorizedError("Invalid or already used reset token");
  }

  if (verification.expiresAt < new Date()) {
    await Verification.findByIdAndDelete(verification._id);
    throw new UnauthorizedError("Password reset token has expired");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User account not found");
  }

  if (newPassword !== confirmPassword) {
    throw new BadRequestError("Passwords do not match");
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashPassword;
  await user.save();

  // Single-use guarantee: Invalidate all reset tokens for this user
  await Verification.deleteMany({ userId });

  res.status(200).json({ message: "Password reset successfully" });
});
