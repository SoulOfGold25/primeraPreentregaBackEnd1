import express from "express";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

const cartRouter = express.Router();

// POST "/" - Crear un nuevo carrito
cartRouter.post("/", async (req, res) => {
    try {
        const newCart = new Cart({ products: [] }); // Se crea con un array vacío de productos
        await newCart.save();
        res.status(201).send(newCart);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// DELETE "/api/carts/:cid/products/:pid" - Eliminar un producto específico del carrito
cartRouter.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).send({ message: "Carrito no encontrado" });

        cart.products = cart.products.filter(item => item.product.toString() !== req.params.pid);
        await cart.save();

        res.status(200).send({ message: "Producto eliminado del carrito", cart });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// PUT "/api/carts/:cid" - Actualizar todos los productos del carrito
cartRouter.put("/:cid", async (req, res) => {
    try {
        const { products } = req.body;
        const updatedCart = await Cart.findByIdAndUpdate(req.params.cid, { products }, { new: true }).populate("products.product");

        if (!updatedCart) return res.status(404).send({ message: "Carrito no encontrado" });

        res.status(200).send(updatedCart);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// PUT "/api/carts/:cid/products/:pid" - Actualizar SÓLO la cantidad de un producto en el carrito
cartRouter.put("/:cid/products/:pid", async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || quantity < 1) {
            return res.status(400).send({ message: "Cantidad inválida" });
        }

        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).send({ message: "Carrito no encontrado" });

        const productInCart = cart.products.find(item => item.product.toString() === req.params.pid);
        if (!productInCart) return res.status(404).send({ message: "Producto no encontrado en el carrito" });

        productInCart.quantity = quantity;
        await cart.save();

        res.status(200).send(cart);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// DELETE "/api/carts/:cid" - Vaciar el carrito
cartRouter.delete("/:cid", async (req, res) => {
    try {
        const cart = await Cart.findByIdAndUpdate(req.params.cid, { products: [] }, { new: true });
        if (!cart) return res.status(404).send({ message: "Carrito no encontrado" });

        res.status(200).send({ message: "Carrito vaciado", cart });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET "/api/carts/:cid" - Traer todos los productos del carrito con detalles completos
cartRouter.get("/:cid", async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate("products.product");
        if (!cart) return res.status(404).send({ message: "Carrito no encontrado" });

        res.status(200).send(cart);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

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

        // Verificar si el producto ya está en el carrito
        const existingProduct = cart.products.find(p => p.product.toString() === pid);
        if (existingProduct) {
            existingProduct.quantity += quantity || 1;
        } else {
            cart.products.push({ product: pid, quantity: quantity || 1 });
        }

        await cart.save();
        res.json({ success: true, cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
});

export default cartRouter;
