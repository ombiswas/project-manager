import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import userRepository from "../repositories/user.repository.js";
import verificationRepository from "../repositories/verification.repository.js";
import { sendEmail } from "../libs/send-email.js";
import { env } from "../config/env.js";
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from "../utils/errors.js";

class AuthService {
  async registerUser({ email, name, password }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("Email address already in use");
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await userRepository.create({
      email,
      password: hashPassword,
      name,
    });

    const verificationToken = jwt.sign(
      { userId: newUser._id, purpose: "email-verification" },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await verificationRepository.deleteByUserId(newUser._id);
    await verificationRepository.create({
      userId: newUser._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`;
    const isEmailSent = await sendEmail(email, "Verify your email", emailBody);

    if (!isEmailSent) {
      throw new AppError("Failed to send verification email", 500);
    }

    return {
      message:
        "Verification email sent to your email. Please check and verify your account.",
    };
  }

  async loginUser({ email, password }) {
    const user = await userRepository.findByEmail(email, {
      includePassword: true,
    });
    if (!user) {
      throw new BadRequestError("Invalid email or password");
    }

    if (!user.isEmailVerified) {
      return await this._handleUnverifiedLogin(user, email);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestError("Invalid email or password");
    }

    const token = jwt.sign(
      { userId: user._id, purpose: "login" },
      env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    await userRepository.updateById(user._id, { lastLogin: new Date() });

    const userData = user.toObject();
    delete userData.password;
    delete userData.__v;

    return {
      token,
      user: userData,
    };
  }

  async _handleUnverifiedLogin(user, email) {
    const existing = await verificationRepository.findByUserId(user._id);

    if (existing && existing.expiresAt > new Date()) {
      throw new BadRequestError(
        "Email not verified. Please check your email for the verification link."
      );
    }

    await verificationRepository.deleteByUserId(user._id);

    const verificationToken = jwt.sign(
      { userId: user._id, purpose: "email-verification" },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await verificationRepository.create({
      userId: user._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`;
    const isEmailSent = await sendEmail(email, "Verify your email", emailBody);

    if (!isEmailSent) {
      throw new AppError("Failed to send verification email", 500);
    }

    return {
      requiresVerification: true,
      message:
        "Verification email sent to your email. Please check and verify your account.",
    };
  }

  async verifyEmail({ token }) {
    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new UnauthorizedError(
          "Verification token has expired. Please request a new one."
        );
      }
      throw new UnauthorizedError("Invalid verification token.");
    }

    const { userId, purpose } = payload;
    if (purpose !== "email-verification") {
      throw new UnauthorizedError("Invalid token purpose");
    }

    const verification = await verificationRepository.findByUserIdAndToken(
      userId,
      token
    );
    if (!verification) {
      throw new UnauthorizedError("Invalid or already used verification token");
    }

    if (verification.expiresAt < new Date()) {
      await verificationRepository.deleteById(verification._id);
      throw new UnauthorizedError("Verification token has expired");
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User account not found");
    }

    if (user.isEmailVerified) {
      await verificationRepository.deleteByUserId(userId);
      throw new BadRequestError("Email is already verified");
    }

    await userRepository.updateById(userId, { isEmailVerified: true });
    await verificationRepository.deleteByUserId(userId);

    return { message: "Email verified successfully" };
  }

  async requestPasswordReset({ email }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("No account found with this email address");
    }

    if (!user.isEmailVerified) {
      throw new BadRequestError(
        "Please verify your email first before resetting password"
      );
    }

    await verificationRepository.deleteByUserId(user._id);

    const resetToken = jwt.sign(
      { userId: user._id, purpose: "reset-password" },
      env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    await verificationRepository.create({
      userId: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailBody = `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`;
    const isEmailSent = await sendEmail(
      email,
      "Reset your password",
      emailBody
    );

    if (!isEmailSent) {
      throw new AppError("Failed to send reset password email", 500);
    }

    return { message: "Reset password email sent" };
  }

  async resetPassword({ token, newPassword, confirmPassword }) {
    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new UnauthorizedError(
          "Password reset token has expired. Please request a new one."
        );
      }
      throw new UnauthorizedError("Invalid password reset token.");
    }

    const { userId, purpose } = payload;
    if (purpose !== "reset-password") {
      throw new UnauthorizedError("Invalid token purpose");
    }

    const verification = await verificationRepository.findByUserIdAndToken(
      userId,
      token
    );
    if (!verification) {
      throw new UnauthorizedError("Invalid or already used reset token");
    }

    if (verification.expiresAt < new Date()) {
      await verificationRepository.deleteById(verification._id);
      throw new UnauthorizedError("Password reset token has expired");
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User account not found");
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestError("Passwords do not match");
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    await userRepository.updateById(userId, { password: hashPassword });
    await verificationRepository.deleteByUserId(userId);

    return { message: "Password reset successfully" };
  }
}

export default new AuthService();
