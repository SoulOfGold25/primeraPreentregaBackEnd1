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

// Eliminar un producto del carrito
cartRouter.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;

        // Buscar el carrito
        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

        // Eliminar el producto del carrito
        cart.products = cart.products.filter(item => item.product.toString() !== pid);
        await cart.save();

        res.status(200).json({ message: "Producto eliminado del carrito", cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar todos los productos del carrito
cartRouter.put("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;  // El nuevo arreglo de productos

        // Verificar que el cuerpo tenga productos
        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ message: "El cuerpo de la solicitud debe contener un arreglo de productos." });
        }

        // Buscar y actualizar el carrito
        const cart = await Cart.findByIdAndUpdate(cid, { products }, { new: true }).populate('products.product');
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar la cantidad de un producto en el carrito
cartRouter.put("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;  // Nueva cantidad

        // Validar cantidad
        if (quantity <= 0) return res.status(400).json({ message: "La cantidad debe ser mayor que 0" });

        // Buscar el carrito
        const cart = await Cart.findById(cid);
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

        // Encontrar el producto en el carrito
        const productInCart = cart.products.find(item => item.product.toString() === pid);
        if (!productInCart) return res.status(404).json({ message: "Producto no encontrado en el carrito" });

        // Actualizar la cantidad
        productInCart.quantity = quantity;
        await cart.save();

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Vaciar el carrito (eliminar todos los productos)
cartRouter.delete("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;

        // Buscar el carrito y vaciarlo
        const cart = await Cart.findByIdAndUpdate(cid, { products: [] }, { new: true });
        if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

        res.status(200).json({ message: "Carrito vaciado", cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default cartRouter;
