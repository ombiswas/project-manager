import userService from "../services/user.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getUserProfile(req.user._id);
  res.status(200).json(profile);
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateUserProfile(
    req.user._id,
    req.body
  );
  res.status(200).json(updatedUser);
});

export const changePassword = asyncHandler(async (req, res) => {
  const result = await userService.changePassword(req.user._id, req.body);
  res.status(200).json(result);
});

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
};
