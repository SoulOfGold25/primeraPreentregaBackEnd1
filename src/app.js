import express from "express";
import productsRouter from "./routes/product.router.js";
import cartRouter from "./routes/cart.router.js";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";
import viewsRouter from "./routes/views.router.js";
import ProductManager from "./ProductManager.js";
import connectMongoDB from "./data/db.js";
import passport from './config/passport.config.js';
import sessionsRouter from './routes/sessions.router.js';
import cookieParser from 'cookie-parser';

// Inicializo Express
const app = express();

// Middleware para procesar JSON
app.use(express.json());

// Middleware para procesar datos codificados en URL (opcional, si usas formularios)
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server);

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Configuración de Passport
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Me conecto con MongoDB
connectMongoDB();

// Puerto
const PORT = 8080;

// Habilitamos la carpeta public
app.use(express.static("public"));

// Endpoints
app.use("/api/products", productsRouter);
app.use("/api/carts", cartRouter);
app.use("/", viewsRouter);
app.use('/api/sessions', sessionsRouter);

// WebSockets
const productManager = new ProductManager("./src/data/products.json");
io.on("connection", (socket) => {
    console.log("Nuevo usuario conectado");

    socket.on("newProduct", async (productData) => {
        try {
            const newProduct = await productManager.addProduct(productData);
            io.emit("productAdded", newProduct);
        } catch (error) {
            console.error("Error añadiendo producto ", error.message);
        }
    });

    socket.on("deleteProductById", async (id) => {
        try {
            await productManager.deleteProductsById(id);
            const updatedProducts = await productManager.getProduct();
            io.emit("productDeleted", updatedProducts);
        } catch (error) {
            console.error("Error al eliminar producto:", error.message);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor iniciado en: http://localhost:${PORT}`);
});