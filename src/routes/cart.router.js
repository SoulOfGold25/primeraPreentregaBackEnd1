import express from 'express';
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

const cartRouter = express.Router();

// Crear un nuevo carrito
cartRouter.post("/", async (req, res) => {
    try {
        const newCart = new Cart({ products: [] });
        await newCart.save();
        res.status(201).send(newCart);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Obtener el último carrito creado
cartRouter.get('/latest', async (req, res) => {
    try {
        const lastCart = await Cart.findOne().sort({ _id: -1 });
        if (!lastCart) return res.status(404).json({ message: "No se encontró un carrito" });
        res.json({ cartId: lastCart._id });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Agregar un producto al carrito
cartRouter.post('/:cartId/products/:pid', async (req, res) => {
    try {
        const { cartId, pid } = req.params;
        const { quantity } = req.body;

        let cart = await Cart.findById(cartId);
        if (!cart) {
            cart = await Cart.create({ products: [] });
        }

        const product = await Product.findById(pid);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const existingProduct = cart.products.find(p => p.product.toString() === pid);
        if (existingProduct) {
            existingProduct.quantity += quantity || 1;
        } else {
            cart.products.push({ product: pid, quantity: quantity || 1 });
        }

        await cart.save();
        res.json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
});

// Obtener todos los productos del carrito
cartRouter.get('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product');
        if (!cart) return res.status(404).send({ message: 'Carrito no encontrado' });
        res.render('cart', { cart });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

export default cartRouter;
