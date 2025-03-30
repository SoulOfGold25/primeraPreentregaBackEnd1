import express from 'express';
import CartManager from '../CartManager.js';
import Cart from "../models/cart.model.js"; // Asegúrate de que la ruta sea correcta

const cartRouter = express.Router();
const cartManager = new CartManager();

// Crear un nuevo carrito
cartRouter.post("/", async (req, res) => {
    try {
        const newCart = await cartManager.addCart();
        res.status(201).send(newCart);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Obtener el último carrito creado
cartRouter.get('/latest', async (req, res) => {
    try {
        const lastCart = await cartManager.getLatestCart();
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

        const cart = await cartManager.addProductById(cartId, pid, quantity);
        res.json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un producto del carrito
cartRouter.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).send({ message: "Carrito no encontrado" });

        cart.products = cart.products.filter((p) => p.product.toString() !== pid);
        await cart.save();

        res.status(200).send({ message: "Producto eliminado del carrito", cart });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Actualizar todos los productos del carrito
cartRouter.put("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        const cart = await Cart.findByIdAndUpdate(cid, { products }, { new: true }).populate("products.product");
        if (!cart) return res.status(404).send({ message: "Carrito no encontrado" });

        res.status(200).send(cart);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Actualizar la cantidad de un producto en el carrito
cartRouter.put("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).send({ message: "Carrito no encontrado" });

        const productInCart = cart.products.find((p) => p.product.toString() === pid);
        if (!productInCart) return res.status(404).send({ message: "Producto no encontrado en el carrito" });

        productInCart.quantity = quantity;
        await cart.save();

        res.status(200).send(cart);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Eliminar todos los productos del carrito
cartRouter.delete("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;

        const cart = await Cart.findByIdAndUpdate(cid, { products: [] }, { new: true });
        if (!cart) return res.status(404).send({ message: "Carrito no encontrado" });

        res.status(200).send({ message: "Carrito vaciado", cart });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Obtener un carrito por ID con populate
cartRouter.get("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;

        // Buscar el carrito por ID y usar populate para obtener los detalles completos de los productos
        const cart = await Cart.findById(cid).populate("products.product").lean();

        if (!cart) {
            return res.status(404).send({ message: "Carrito no encontrado" });
        }

        res.status(200).send(cart);
    } catch (error) {
        console.error("Error al obtener el carrito:", error.message);
        res.status(500).send({ message: error.message });
    }
});
export default cartRouter;