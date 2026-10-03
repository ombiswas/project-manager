import activityRepository from "../repositories/activity.repository.js";
import { logger } from "./logger.js";

/**
 * Unified helper for consistent activity logging across services.
 * Silently logs errors if activity creation fails, ensuring main business workflows don't crash.
 *
 * @param {string|ObjectId} userId
 * @param {string} action
 * @param {string} resourceType
 * @param {string|ObjectId} resourceId
 * @param {Object} [details]
 * @param {ClientSession} [session]
 */
export const recordActivity = async (
  userId,
  action,
  resourceType,
  resourceId,
  details = {},
  session = null
) => {
  try {
    return await activityRepository.create(
      {
        user: userId,
        action,
        resourceType,
        resourceId,
        details,
      },
      session
    );
  } catch (error) {
    logger.error("Failed to record activity log:", {
      userId,
      action,
      resourceType,
      resourceId,
      error: error.message,
    });
  }
};

export default { recordActivity };
