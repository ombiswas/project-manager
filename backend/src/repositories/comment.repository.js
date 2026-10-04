import Comment from "../models/comment.js";

class CommentRepository {
  async create(commentData, session = null) {
    const opts = session ? { session } : {};
    const [comment] = await Comment.create([commentData], opts);
    return comment;
  }

  async findByTaskId(taskId, { page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      Comment.find({ task: taskId })
        .populate("author", "name email profilePicture")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ task: taskId }),
    ]);

    return { comments, total, page, limit };
  }

  async deleteManyByTasks(taskIds, session = null) {
    const opts = session ? { session } : {};
    return await Comment.deleteMany({ task: { $in: taskIds } }, opts);
  }

  async deleteManyByTask(taskId, session = null) {
    const opts = session ? { session } : {};
    return await Comment.deleteMany({ task: taskId }, opts);
  }

  async deleteManyByAuthor(authorId, session = null) {
    const opts = session ? { session } : {};
    return await Comment.deleteMany({ author: authorId }, opts);
  }
}

export default new CommentRepository();
