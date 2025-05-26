import UserDAO from '../user.dao.js';   


const userDao = new UserDAO();

export default class UserRepository {
  getUsers() {
    return userDao.getAll();
  }

  getUserById(id) {
    return userDao.getById(id);
  }

  getUserByEmail(email) {
    return userDao.getByEmail(email);
  }

  createUser(data) {
    return userDao.create(data);
  }

  updateUser(id, data) {
    return userDao.update(id, data);
  }

  deleteUser(id) {
    return userDao.delete(id);
  }

  addProductToCart(cartId, productId, quantity) {
    return cartDao.addProductToCart(cartId, productId, quantity);
  }
}
