import mongoose from "mongoose";
import { logger } from "./logger.js";

/**
 * Executes a callback within a MongoDB transaction if replica sets are enabled,
 * or safely executes sequentially with fallback for standalone MongoDB instances.
 *
 * @param {Function} workFn - async function(session) => any
 * @returns {Promise<any>}
 */
export const withTransaction = async (workFn) => {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    return await workFn(null);
  }

  let session = null;
  try {
    session = await mongoose.startSession();
  } catch (err) {
    // If sessions/transactions are not supported on this MongoDB deployment
    logger.warn("Mongoose sessions not supported on this deployment; running without transaction session:", err.message);
    return await workFn(null);
  }

  try {
    let result;
    let transactionStarted = false;

    try {
      session.startTransaction();
      transactionStarted = true;
    } catch (startErr) {
      logger.warn("MongoDB transactions not supported on this instance (e.g. standalone mode). Running sequentially:", startErr.message);
    }

    if (transactionStarted) {
      try {
        result = await workFn(session);
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      }
    } else {
      result = await workFn(null);
    }

    return result;
  } finally {
    if (session) {
      await session.endSession().catch((e) => {
        logger.debug("Error ending session:", e);
      });
    }
  }
};
