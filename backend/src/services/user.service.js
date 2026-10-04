import bcrypt from "bcrypt";
import userRepository from "../repositories/user.repository.js";
import workspaceRepository from "../repositories/workspace.repository.js";
import projectRepository from "../repositories/project.repository.js";
import taskRepository from "../repositories/task.repository.js";
import commentRepository from "../repositories/comment.repository.js";
import activityRepository from "../repositories/activity.repository.js";
import verificationRepository from "../repositories/verification.repository.js";
import workspaceService from "./workspace.service.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import { withTransaction } from "../utils/transaction.js";
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

  async changePassword(
    userId,
    { currentPassword, newPassword, confirmPassword }
  ) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestError(
        "New password and confirm password do not match"
      );
    }

    const user = await userRepository.findById(userId, "+password");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new ForbiddenError("Invalid old password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updateById(userId, { password: hashedPassword });

    return { message: "Password updated successfully" };
  }

  async deleteAccount(userId, { password } = {}) {
    const user = await userRepository.findById(userId, "+password");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // If account has a password set, require password verification
    if (user.password) {
      if (!password) {
        throw new BadRequestError(
          "Password is required to delete your account"
        );
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new ForbiddenError("Invalid password");
      }
    }

    return await withTransaction(async (session) => {
      // 1. Process workspaces owned by the user
      const ownedWorkspaces =
        await workspaceRepository.findWorkspacesByOwner(userId);
      for (const ws of ownedWorkspaces) {
        const remainingMembers = (ws.members || []).filter(
          (m) => (m.user?._id || m.user).toString() !== userId.toString()
        );

        if (remainingMembers.length === 0) {
          // Sole member: cascade delete the entire workspace
          await workspaceService.cascadeDeleteWorkspace(ws._id, session);
        } else {
          // Transfer ownership to the next senior member (admin first, else first member)
          const successor =
            remainingMembers.find((m) => m.role === "admin") ||
            remainingMembers[0];
          const newOwnerId = successor.user?._id || successor.user;

          // Update workspace owner and remove deleting user from members
          await workspaceRepository.updateById(
            ws._id,
            {
              owner: newOwnerId,
              $pull: { members: { user: userId } },
            },
            session
          );

          // Promote successor to admin/owner
          await workspaceRepository.updateMemberRoleByUser(
            ws._id,
            newOwnerId,
            "admin",
            session
          );

          // Reassign projects created by deleting user in this workspace
          await projectRepository.reassignCreator(userId, newOwnerId, session);

          // Reassign tasks created by deleting user in this workspace
          await taskRepository.reassignCreator(userId, newOwnerId, session);
        }
      }

      // 2. Remove user from all workspaces where they were a regular member
      await workspaceRepository.pullMemberFromAllWorkspaces(userId, session);

      // 3. Remove user from all project member arrays
      await projectRepository.pullMemberFromAllProjects(userId, session);

      // 4. Reassign any remaining projects created by this user in other workspaces
      const orphanedProjects = await Project.find({
        createdBy: userId,
      }).session(session);
      for (const proj of orphanedProjects) {
        const ws = await workspaceRepository.findById(proj.workspace);
        if (ws && ws.owner) {
          await Project.findByIdAndUpdate(
            proj._id,
            { createdBy: ws.owner },
            { session }
          );
        }
      }

      // 5. Pull user from assignees and watchers across all tasks
      await taskRepository.pullUserFromAllTasks(userId, session);

      // 6. Reassign any remaining tasks created by this user to project creator
      const orphanedTasks = await Task.find({ createdBy: userId }).session(
        session
      );
      for (const t of orphanedTasks) {
        const proj = await projectRepository.findById(t.project);
        if (proj && proj.createdBy) {
          await Task.findByIdAndUpdate(
            t._id,
            { createdBy: proj.createdBy },
            { session }
          );
        }
      }

      // 7. Nullify uploadedBy on task attachments uploaded by this user
      await Task.updateMany(
        { "attachments.uploadedBy": userId },
        { $unset: { "attachments.$[elem].uploadedBy": "" } },
        { arrayFilters: [{ "elem.uploadedBy": userId }], session }
      );

      // 8. Delete all comments authored by user
      await commentRepository.deleteManyByAuthor(userId, session);

      // 9. Delete all activity logs generated by user
      await activityRepository.deleteManyByUser(userId, session);

      // 10. Delete all workspace invitations for or from this user
      await workspaceRepository.deleteManyInvitesByUser(
        userId,
        user.email,
        session
      );

      // 11. Delete all verification tokens for this user
      await verificationRepository.deleteByUserId(userId, session);

      // 12. Delete user record
      await userRepository.deleteById(userId, session);

      return { message: "Account deleted successfully" };
    });
  }
}

export default new UserService();
