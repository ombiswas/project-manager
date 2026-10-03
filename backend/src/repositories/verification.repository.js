import Verification from "../models/verification.js";

class VerificationRepository {
  async create(data, session = null) {
    const opts = session ? { session } : {};
    const [record] = await Verification.create([data], opts);
    return record;
  }

  async findByUserIdAndToken(userId, token) {
    return await Verification.findOne({ userId, token });
  }

  async deleteByUserId(userId, session = null) {
    const opts = session ? { session } : {};
    return await Verification.deleteMany({ userId }, opts);
  }

  async deleteById(id, session = null) {
    const opts = session ? { session } : {};
    return await Verification.findByIdAndDelete(id, opts);
  }
}

export default new VerificationRepository();
