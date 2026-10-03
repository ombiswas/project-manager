import authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const registerUser = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
});

export const loginUser = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  if (result.requiresVerification) {
    return res.status(200).json({ message: result.message });
  }
  res.status(200).json({
    message: "Login successful",
    token: result.token,
    user: result.user,
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.body);
  res.status(200).json(result);
});

export const resetPasswordRequest = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(req.body);
  res.status(200).json(result);
});

export const verifyResetPasswordTokenAndResetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  res.status(200).json(result);
});

export default {
  registerUser,
  loginUser,
  verifyEmail,
  resetPasswordRequest,
  verifyResetPasswordTokenAndResetPassword,
};
