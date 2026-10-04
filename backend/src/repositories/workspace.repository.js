import Workspace from "../models/workspace.js";
import WorkspaceInvite from "../models/workspace-invite.js";

class WorkspaceRepository {
  async create(workspaceData, session = null) {
    const opts = session ? { session } : {};
    const [workspace] = await Workspace.create([workspaceData], opts);
    return workspace;
  }

  async findById(id) {
    return await Workspace.findById(id)
      .populate("owner", "name email profilePicture")
      .populate("members.user", "name email profilePicture");
  }

  async findRawById(id) {
    return await Workspace.findById(id);
  }

  async findWorkspacesByUser(
    userId,
    {
      page = 1,
      limit = 20,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = {}
  ) {
    const query = {
      $or: [{ owner: userId }, { "members.user": userId }],
    };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [workspaces, total] = await Promise.all([
      Workspace.find(query)
        .populate("owner", "name email profilePicture")
        .populate("members.user", "name email profilePicture")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Workspace.countDocuments(query),
    ]);

    return { workspaces, total, page, limit };
  }

  async updateById(id, updateData, session = null) {
    const opts = session ? { session, new: true } : { new: true };
    return await Workspace.findByIdAndUpdate(id, updateData, opts);
  }

  async deleteById(id, session = null) {
    const opts = session ? { session } : {};
    return await Workspace.findByIdAndDelete(id, opts);
  }

  async addMember(workspaceId, { user, role = "member" }, session = null) {
    const opts = session ? { session, new: true } : { new: true };
    return await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $push: {
          members: {
            user,
            role,
            joinedAt: new Date(),
          },
        },
      },
      opts
    );
  }

  async removeMember(workspaceId, memberId, session = null) {
    const opts = session ? { session, new: true } : { new: true };
    return await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $pull: {
          members: { _id: memberId },
        },
      },
      opts
    );
  }

  async updateMemberRole(workspaceId, memberId, role, session = null) {
    const opts = session ? { session, new: true } : { new: true };
    return await Workspace.findOneAndUpdate(
      { _id: workspaceId, "members._id": memberId },
      { $set: { "members.$.role": role } },
      opts
    );
  }

  async updateMemberRoleByUser(workspaceId, userId, role, session = null) {
    const opts = session ? { session, new: true } : { new: true };
    return await Workspace.findOneAndUpdate(
      { _id: workspaceId, "members.user": userId },
      { $set: { "members.$.role": role } },
      opts
    );
  }

  async transferOwnership(workspaceId, newOwnerId, session = null) {
    const opts = session ? { session, new: true } : { new: true };
    return await Workspace.findByIdAndUpdate(
      workspaceId,
      { owner: newOwnerId },
      opts
    );
  }

  async addProjectToWorkspace(workspaceId, projectId, session = null) {
    const opts = session ? { session } : {};
    return await Workspace.findByIdAndUpdate(
      workspaceId,
      { $addToSet: { projects: projectId } },
      opts
    );
  }

  async removeProjectFromWorkspace(workspaceId, projectId, session = null) {
    const opts = session ? { session } : {};
    return await Workspace.findByIdAndUpdate(
      workspaceId,
      { $pull: { projects: projectId } },
      opts
    );
  }

  // --- Workspace Invite operations ---
  async createInvite(inviteData, session = null) {
    const opts = session ? { session } : {};
    const [invite] = await WorkspaceInvite.create([inviteData], opts);
    return invite;
  }

  async findInvite(query) {
    return await WorkspaceInvite.findOne(query);
  }

  async deleteInvite(query, session = null) {
    const opts = session ? { session } : {};
    return await WorkspaceInvite.deleteOne(query, opts);
  }

  async deleteManyInvites(query, session = null) {
    const opts = session ? { session } : {};
    return await WorkspaceInvite.deleteMany(query, opts);
  }

  async findWorkspacesByOwner(ownerId) {
    return await Workspace.find({ owner: ownerId });
  }

  async pullMemberFromAllWorkspaces(userId, session = null) {
    const opts = session ? { session } : {};
    return await Workspace.updateMany(
      { "members.user": userId },
      { $pull: { members: { user: userId } } },
      opts
    );
  }

  async deleteManyInvitesByUser(userId, email, session = null) {
    const opts = session ? { session } : {};
    const conditions = [{ user: userId }];
    if (email) {
      conditions.push({ email: email.toLowerCase().trim() });
    }
    return await WorkspaceInvite.deleteMany({ $or: conditions }, opts);
  }
}

export default new WorkspaceRepository();
