import express from "express";
import productsRouter from "./routes/product.router.js";
import cartRouter from "./routes/cart.router.js";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";
import viewsRouter from "./routes/views.router.js";
import Product from "./models/product.model.js"; 
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
io.on("connection", (socket) => {
    console.log("Nuevo usuario conectado");

    // Enviar lista de productos al cliente al conectarse
    socket.on("getProducts", async () => {
        try {
            const products = await Product.find().lean();
            socket.emit("updateProducts", products);
        } catch (error) {
            console.error("Error al obtener productos:", error.message);
        }
    });

    // Crear un nuevo producto
    socket.on("newProduct", async (productData) => {
        try {
            const newProduct = new Product(productData);
            await newProduct.save();
            const products = await Product.find().lean();
            io.emit("updateProducts", products); // Actualizar la lista para todos los clientes
        } catch (error) {
            console.error("Error añadiendo producto:", error.message);
        }
    });

    // Eliminar un producto por ID
    socket.on("deleteProductById", async (id) => {
        try {
            await Product.findByIdAndDelete(id);
            const products = await Product.find().lean();
            io.emit("updateProducts", products); // Actualizar la lista para todos los clientes
        } catch (error) {
            console.error("Error al eliminar producto:", error.message);
        }
    });
});

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor iniciado en: http://localhost:${PORT}`);
});