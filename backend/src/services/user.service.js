import bcrypt from "bcrypt";
import userRepository from "../repositories/user.repository.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors.js";

class UserService {
  async getUserProfile(userId) {
    const user = await userRepository.findById(userId, "-password");
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async updateUserProfile(userId, { name, profilePicture }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (name !== undefined) user.name = name;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    return await userRepository.updateById(userId, {
      name: user.name,
      profilePicture: user.profilePicture,
    });
  }

  async changePassword(userId, { currentPassword, newPassword, confirmPassword }) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestError("New password and confirm password do not match");
    }

    const user = await userRepository.findById(userId, "+password");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ForbiddenError("Invalid old password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updateById(userId, { password: hashedPassword });

    return { message: "Password updated successfully" };
  }
}

export default new UserService();
