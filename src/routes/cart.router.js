import express from 'express';
import Cart from '../dao/models/cart.model.js'; // Asegúrate de que la ruta sea correcta
import { checkRole } from '../middlewares/authorization.js';
import TicketRepository from '../dao/repositories/ticket.repository.js';
import CartRepository from '../dao/repositories/cart.repository.js';
import ProductRepository from '../dao/repositories/product.repository.js';
import crypto from "crypto";
import { sendPurchaseEmail } from "../services/email.services.js";


const cartRouter = express.Router();
const ticketRepo = new TicketRepository();
const cartRepo = new CartRepository();
const productRepo = new ProductRepository();

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
cartRouter.post('/:cartId/products/:pid', checkRole("user"), async (req, res) => {
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




cartRouter.post("/:cid/purchase", checkRole("user"), async (req, res) => {
    const { cid } = req.params;
    const user = req.user;
  
    const cart = await cartRepo.getCartById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
  
    const notProcessed = [];
    let totalAmount = 0;
  
    for (const item of cart.products) {
      const product = await productRepo.getProductById(item.product._id);
  
      if (product.stock >= item.quantity) {
        product.stock -= item.quantity;
        await productRepo.updateProduct(product._id, { stock: product.stock });
  
        totalAmount += product.price * item.quantity;
      } else {
        notProcessed.push(item.product._id);
      }
    }
  
    if (totalAmount > 0) {
      const ticketData = {
        code: crypto.randomUUID(),
        amount: totalAmount,
        purchaser: user.email
      };
      await ticketRepo.createTicket(ticketData);
      // Enviar por correo
await sendPurchaseEmail(user.email, ticket);
    }
  
    // Actualizar carrito: dejar sólo productos no procesados
    cart.products = cart.products.filter(item => notProcessed.includes(item.product._id.toString()));
    await cartRepo.updateCart(cid, cart);
  
    res.json({
      message: "Compra finalizada",
      notProcessed
    });
  });
export default cartRouter;