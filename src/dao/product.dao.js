import ProductModel from '../dao/models/product.model.js';

export default class ProductDAO {
  async getAll() {
    return await ProductModel.find();
  }

  async getById(id) {
    return await ProductModel.findById(id);
  }

  async create(product) {
    return await ProductModel.create(product);
  }

  async update(id, data) {
    return await ProductModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await ProductModel.findByIdAndDelete(id);
  }
}
