import { UserModel } from '../dao/models/user.model.js";

export default class UserDAO {
  async getAll() {
    return await UserModel.find();
  }

  async getById(id) {
    return await UserModel.findById(id);
  }

  async getByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async create(user) {
    return await UserModel.create(user);
  }

  async update(id, data) {
    return await UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await UserModel.findByIdAndDelete(id);
  }
}
