import CartDAO from "../cart.dao.js";

const cartDao = new CartDAO();

export default class CartRepository {
  getCarts() {
    return cartDao.getAll();
  }

  getCartById(id) {
    return cartDao.getById(id);
  }

  createCart(data) {
    return cartDao.create(data);
  }

  updateCart(id, data) {
    return cartDao.update(id, data);
  }

  deleteCart(id) {
    return cartDao.delete(id);
  }
  
  addProductToCart(cartId, productId, quantity = 1) {
    return cartDao.addProductToCart(cartId, productId, quantity);
  }
}
