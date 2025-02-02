import fs from 'fs';

class ProductManager {
  constructor(file) {
    this.file = file;
  }

  async getProducts() {
    try {
      const data = await fs.promises.readFile(this.file, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(product => product.id === id);
  }

  async addProduct(product) {
    const products = await this.getProducts();
    product.id = this.generateId(products);
    products.push(product);
    await fs.promises.writeFile(this.file, JSON.stringify(products, null, 2));
    return product;
  }

  generateId(products) {
    const ids = products.map(product => product.id);
    return Math.max(...ids, 0) + 1; // Genera un nuevo ID único
  }
}

export default ProductManager;
