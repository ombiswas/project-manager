import Project from "../models/project.js";

class ProjectRepository {
  async create(projectData, session = null) {
    const opts = session ? { session } : {};
    const [project] = await Project.create([projectData], opts);
    return project;
  }

  async findById(id) {
    return await Project.findById(id)
      .populate("members", "name email profilePicture")
      .populate("createdBy", "name email profilePicture");
  }

  async findRawById(id) {
    return await Project.findById(id);
  }

  async findByWorkspace(
    workspaceId,
    {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = {}
  ) {
    const query = { workspace: workspaceId, isArchived: false };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate("members", "name email profilePicture")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(query),
    ]);

    return { projects, total, page, limit };
  }

  async findProjectIdsByWorkspace(workspaceId) {
    const projects = await Project.find(
      { workspace: workspaceId },
      "_id"
    ).lean();
    return projects.map((p) => p._id);
  }

  async updateById(id, updateData, session = null) {
    const opts = session ? { session, new: true } : { new: true };
    return await Project.findByIdAndUpdate(id, updateData, opts);
  }

  async deleteById(id, session = null) {
    const opts = session ? { session } : {};
    return await Project.findByIdAndDelete(id, opts);
  }

  async deleteManyByWorkspace(workspaceId, session = null) {
    const opts = session ? { session } : {};
    return await Project.deleteMany({ workspace: workspaceId }, opts);
  }

  async addTaskToProject(projectId, taskId, session = null) {
    const opts = session ? { session } : {};
    return await Project.findByIdAndUpdate(
      projectId,
      { $addToSet: { tasks: taskId } },
      opts
    );
  }

  async removeTaskFromProject(projectId, taskId, session = null) {
    const opts = session ? { session } : {};
    return await Project.findByIdAndUpdate(
      projectId,
      { $pull: { tasks: taskId } },
      opts
    );
  }
}

export default new ProjectRepository();
