import ActivityLog from "../models/activity.js";

class ActivityRepository {
  async create(activityData, session = null) {
    const opts = session ? { session } : {};
    const [log] = await ActivityLog.create([activityData], opts);
    return log;
  }

  async findByResourceId(resourceId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      ActivityLog.find({ resourceId })
        .populate("user", "name email profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments({ resourceId }),
    ]);

    return { logs, total, page, limit };
  }

  async deleteManyByResourceIds(resourceIds, session = null) {
    const opts = session ? { session } : {};
    return await ActivityLog.deleteMany(
      { resourceId: { $in: resourceIds } },
      opts
    );
  }
}

export default new ActivityRepository();
