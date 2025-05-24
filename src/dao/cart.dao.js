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

  async addProductToCart(cartId, productId, quantity) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");
  
    const existingProduct = cart.products.find(p => p.product.toString() === productId);
  
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }
  
    await cart.save();
    return cart;
  }
  
}
