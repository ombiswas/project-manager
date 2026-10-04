import Task from "../models/task.js";

class TaskRepository {
  async create(taskData, session = null) {
    const opts = session ? { session } : {};
    const [task] = await Task.create([taskData], opts);
    return task;
  }

  async findById(id) {
    return await Task.findById(id)
      .populate("assignees", "name email profilePicture")
      .populate("watchers", "name email profilePicture")
      .populate("createdBy", "name email profilePicture");
  }

  async findRawById(id) {
    return await Task.findById(id);
  }

  async findByProject(
    projectId,
    {
      page = 1,
      limit = 50,
      search,
      status,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = {}
  ) {
    const query = { project: projectId, isArchived: false };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate("assignees", "name email profilePicture")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ]);

    return { tasks, total, page, limit };
  }

  async findMyTasks(
    userId,
    {
      page = 1,
      limit = 50,
      search,
      status,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = {}
  ) {
    const query = { assignees: userId, isArchived: false };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate("project", "title workspace")
        .populate("assignees", "name email profilePicture")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ]);

    return { tasks, total, page, limit };
  }

  async findArchivedTasks(
    userId,
    {
      page = 1,
      limit = 50,
      search,
      status,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = {}
  ) {
    const query = { assignees: userId, isArchived: true };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate("project", "title workspace")
        .populate("assignees", "name email profilePicture")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ]);

    return { tasks, total, page, limit };
  }

  async updateById(id, updateData, session = null) {
    const opts = session ? { session, new: true } : { new: true };
    return await Task.findByIdAndUpdate(id, updateData, opts);
  }

  async deleteById(id, session = null) {
    const opts = session ? { session } : {};
    return await Task.findByIdAndDelete(id, opts);
  }

  async deleteManyByProject(projectId, session = null) {
    const opts = session ? { session } : {};
    return await Task.deleteMany({ project: projectId }, opts);
  }

  async deleteManyByProjects(projectIds, session = null) {
    const opts = session ? { session } : {};
    return await Task.deleteMany({ project: { $in: projectIds } }, opts);
  }

  async findTaskIdsByProject(projectId) {
    const tasks = await Task.find({ project: projectId }, "_id").lean();
    return tasks.map((t) => t._id);
  }

  async findTaskIdsByProjects(projectIds) {
    const tasks = await Task.find(
      { project: { $in: projectIds } },
      "_id"
    ).lean();
    return tasks.map((t) => t._id);
  }

  async findTasksByProjects(projectIds, filter = {}) {
    if (!projectIds || projectIds.length === 0) return [];
    return await Task.find({ project: { $in: projectIds }, ...filter })
      .sort({ createdAt: -1 })
      .lean();
  }

  async countByProject(projectId, filter = {}) {
    return await Task.countDocuments({ project: projectId, ...filter });
  }
}

export default new TaskRepository();
