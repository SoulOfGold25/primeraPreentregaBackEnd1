import ProductDAO from '../product.dao.js';

const productDao = new ProductDAO();

export default class ProductRepository {
  getProducts() {
    return productDao.getAll();
  }

  getProductById(id) {
    return productDao.getById(id);
  }

  createProduct(data) {
    return productDao.create(data);
  }

  updateProduct(id, data) {
    return productDao.update(id, data);
  }

  deleteProduct(id) {
    return productDao.delete(id);
  }
}
