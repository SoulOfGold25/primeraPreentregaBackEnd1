import express from "express";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import ProductManager from "../ProductManager.js";

const viewsRouter = express.Router();
const productManager = new ProductManager();
// Ruta Home: Mostrar productos con paginación, filtros y ordenamiento
viewsRouter.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort === "asc" ? { price: 1 } : req.query.sort === "desc" ? { price: -1 } : {};
        const query = req.query.query ? { $or: [{ category: req.query.query }, { status: req.query.query === "true" }] } : {};

        const productsData = await Product.paginate(query, {
            limit,
            page,
            sort,
            lean: true, // Convierte los documentos en objetos simples
        });

        res.render("home", {
            status: "success",
            products: productsData.docs,
            totalPages: productsData.totalPages,
            prevPage: productsData.prevPage,
            nextPage: productsData.nextPage,
            page: productsData.page,
            hasPrevPage: productsData.hasPrevPage,
            hasNextPage: productsData.hasNextPage,
            prevLink: productsData.hasPrevPage ? `/products?limit=${limit}&page=${productsData.prevPage}&sort=${req.query.sort}&query=${req.query.query}` : null,
            nextLink: productsData.hasNextPage ? `/products?limit=${limit}&page=${productsData.nextPage}&sort=${req.query.sort}&query=${req.query.query}` : null,
        });
    } catch (error) {
        console.error("Error al obtener productos:", error.message);
        res.status(500).send({ status: "error", message: error.message });
    }
});

// Ruta para ver los detalles del producto
viewsRouter.get("/products/:pid", async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid).lean();

        if (!product) {
            return res.status(404).send("Producto no encontrado");
        }

        res.render("productDetail", { product });
    } catch (error) {
        res.status(500).send("Error al obtener los detalles del producto");
    }
});

// Ruta para ver productos en tiempo real
viewsRouter.get("/realtimeproducts", async (req, res) => {
    try {
        const products = await Product.find().lean();
        res.render("realTimeProducts", { products });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Ruta para ver los detalles del carrito
viewsRouter.get("/carts/:cid", async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product').lean();

        if (!cart) {
            return res.status(404).send("Carrito no encontrado");
        }

        res.render("cart", { cart });
    } catch (error) {
        res.status(500).send("Error al obtener los detalles del carrito");
    }
});

// Rutas para login y registro
viewsRouter.get('/login', (req, res) => {
    res.render('login', { title: 'Iniciar Sesión' });
});

viewsRouter.get('/register', (req, res) => {
    res.render('register', { title: 'Registro' });
});

export default viewsRouter;