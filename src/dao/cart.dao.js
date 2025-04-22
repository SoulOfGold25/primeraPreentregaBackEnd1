import CartModel  from '../dao/models/cart.model.js';

export default class CartDAO {
  async getAll() {
    return await CartModel.find().populate("products.product");
  }

  async getById(id) {
    return await CartModel.findById(id).populate("products.product");
  }

  async create(cart = { products: [] }) {
    return await CartModel.create(cart);
  }

  async update(id, data) {
    return await CartModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await CartModel.findByIdAndDelete(id);
  }
}
