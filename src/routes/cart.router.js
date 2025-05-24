import express from "express";
import Cart from "../dao/models/cart.model.js";
import { checkRole } from "../middlewares/authorization.js";
import ticketRepository from "../dao/repositories/ticket.repository.js";
import CartRepository from "../dao/repositories/cart.repository.js";
import ProductRepository from "../dao/repositories/product.repository.js";
import crypto from "crypto";
import sendPurchaseEmail from "../services/email.services.js";
import { passportCall } from "../utils.js";
import { v4 as uuidv4 } from "uuid";
import CartModel from "../dao/models/cart.model.js";

const cartRouter = express.Router();
// const ticket = await ticketRepository.generate(ticketData);
const cartRepository = new CartRepository();
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
cartRouter.post(
  "/:cartId/products/:pid",
  passportCall("jwt"),
  checkRole("user"),
  async (req, res) => {
    try {
      const { cartId, pid } = req.params;
      const { quantity } = req.body;

      const updatedCart = await cartRepository.addProductToCart(
        cartId,
        pid,
        quantity
      );

      res.json({ success: true, cart: updatedCart });
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

// Agregar un producto al carrito
cartRouter.post(
  "/products/:pid",
  passportCall("jwt"),
  checkRole("user"),
  async (req, res) => {
    try {
      const cartId = req.user.cartId; // ← Obtenido desde el JWT
      const productId = req.params.pid;
      const quantity = req.body.quantity || 1;

      if (!cartId) return res.status(400).send({ error: "No se encontró un carrito asociado al usuario." });

      const updatedCart = await cartRepository.addProductToCart(cartId, productId, quantity);

      res.status(200).send({ success: true, cart: updatedCart });
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error.message);
      res.status(500).send({ error: error.message });
    }
  }
);

// Eliminar un producto del carrito
cartRouter.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart)
      return res.status(404).send({ message: "Carrito no encontrado" });

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

    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products },
      { new: true }
    ).populate("products.product");
    if (!cart)
      return res.status(404).send({ message: "Carrito no encontrado" });

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
    if (!cart)
      return res.status(404).send({ message: "Carrito no encontrado" });

    const productInCart = cart.products.find(
      (p) => p.product.toString() === pid
    );
    if (!productInCart)
      return res
        .status(404)
        .send({ message: "Producto no encontrado en el carrito" });

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

    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    );
    if (!cart)
      return res.status(404).send({ message: "Carrito no encontrado" });

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

cartRouter.post("/:cid/purchase", passportCall("jwt"), async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await CartModel.findById(cid).populate("products.product");

    if (!cart) return res.status(404).send({ error: "Carrito no encontrado" });

    let total = 0;
    const purchasedProducts = [];
    const rejectedProducts = [];

    for (const item of cart.products) {
      const product = item.product;
      const quantity = item.quantity;

      if (product.stock >= quantity) {
        product.stock -= quantity;
        await product.save();
        total += product.price * quantity;
        purchasedProducts.push(item);
      } else {
        rejectedProducts.push(item);
      }
    }

    if (purchasedProducts.length === 0) {
      return res.status(400).json({
        message: "No se pudo procesar ningún producto por falta de stock",
        noStock: rejectedProducts.map((p) => p.product._id),
      });
    }

    const ticketData = {
      code: uuidv4(),
      amount: total,
      purchaser: req.user.email,
    };

    const ticket = await ticketRepository.generate(ticketData);

    await sendPurchaseEmail(req.user.email, ticket);

    cart.products = rejectedProducts;
    await cart.save();

    req.session.ticket = ticket;
    req.session.noStock = rejectedProducts.map(p => ({
      id: p.product._id,
      title: p.product.title,
      stock: p.product.stock
    }));
    
    req.session.purchasedProducts = purchasedProducts.map(p => ({
      title: p.product.title,
      price: p.product.price,
      quantity: p.quantity
    }));
    
    res.redirect("/purchase/success");
  } catch (error) {
    console.error("❌ Error en compra:", error);
    res.status(500).send({ error: "Error en el proceso de compra" });
  }
});
export default cartRouter;
