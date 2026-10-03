import User from "../models/user.js";

class UserRepository {
  async findById(id, selectFields = null) {
    let query = User.findById(id);
    if (selectFields) {
      query = query.select(selectFields);
    }
    return await query;
  }

  async findByEmail(email, { includePassword = false } = {}) {
    let query = User.findOne({ email: email.toLowerCase().trim() });
    if (includePassword) {
      query = query.select("+password");
    }
    return await query;
  }

  async create(userData, session = null) {
    const opts = session ? { session } : {};
    const [user] = await User.create([userData], opts);
    return user;
  }

  async updateById(id, updateData, session = null) {
    const opts = session ? { session, new: true } : { new: true };
    return await User.findByIdAndUpdate(id, updateData, opts);
  }

  async deleteById(id, session = null) {
    const opts = session ? { session } : {};
    return await User.findByIdAndDelete(id, opts);
  }
}

export default new UserRepository();
