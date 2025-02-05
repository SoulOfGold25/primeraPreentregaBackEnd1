import fs from "fs";

class CartManager {
  constructor(file) {
    this.file = file;
  }

  async getCarts() {
    try {
      const data = await fs.promises.readFile(this.file, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find((cart) => cart.id === id);
  }

  async createCart() {
    const carts = await this.getCarts();
    const newCart = { id: this.generateId(carts), products: [] };
    carts.push(newCart);
    await fs.promises.writeFile(this.file, JSON.stringify(carts, null, 2));
    return newCart;
  }

  async addProductToCart(cartId, productId) {
    const carts = await this.getCarts();
    const cart = carts.find((c) => c.id === cartId);

    if (!cart) return null;

    const existingProduct = cart.products.find((p) => p.product === productId);
    if (existingProduct) {
      existingProduct.quantity += 1; // Si el producto ya está, aumenta la cantidad
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await fs.promises.writeFile(this.file, JSON.stringify(carts, null, 2));
    return cart;
  }

  generateId(carts) {
    const ids = carts.map((cart) => cart.id);
    return Math.max(...ids, 0) + 1; // Genera un nuevo ID único
  }
}

export default CartManager;
