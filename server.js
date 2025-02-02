import express from 'express';
import ProductManager from './productManager.js';
import CartManager from './cartManager.js';

const app = express();
const port = 8080;

app.use(express.json()); // Para parsear JSON en el body

// Inicialización de ProductManager y CartManager
const productManager = new ProductManager('./products.json');
const cartManager = new CartManager('./carts.json');

// Rutas para productos
const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
  const products = await productManager.getProducts();
  res.json(products);
});

productRouter.get('/:pid', async (req, res) => {
  const product = await productManager.getProductById(Number(req.params.pid));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

productRouter.post('/', async (req, res) => {
  const { title, description, code, price, status, stock, category, thumbnails } = req.body;
  if (!title || !description || !code || !price || !status || !stock || !category || !thumbnails) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const newProduct = await productManager.addProduct({
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails
  });
  res.status(201).json(newProduct);
});

// Rutas para carritos
const cartRouter = express.Router();

cartRouter.get('/', async (req, res) => {
  const carts = await cartManager.getCarts();
  res.json(carts);
});

cartRouter.get('/:cid', async (req, res) => {
  const cart = await cartManager.getCartById(Number(req.params.cid));
  if (cart) {
    res.json(cart);
  } else {
    res.status(404).json({ error: 'Carrito no encontrado' });
  }
});

cartRouter.post('/', async (req, res) => {
  const newCart = await cartManager.createCart();
  res.status(201).json(newCart);
});

cartRouter.post('/:cid/product/:pid', async (req, res) => {
  const updatedCart = await cartManager.addProductToCart(Number(req.params.cid), Number(req.params.pid));
  if (updatedCart) {
    res.json(updatedCart);
  } else {
    res.status(404).json({ error: 'Carrito o producto no encontrado' });
  }
});

// Enlazar routers a las rutas principales
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
