// Importar dependencias
import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";

//import routes
import productsRouter from "./routes/product.router.js";
import cartRouter from "./routes/cart.router.js";
import viewsRouter from "./routes/views.router.js";
import sessionsRouter from './routes/sessions.router.js'
import usersViewRouter from './routes/users.views.router.js';

//import Data
import connectMongoDB from "./data/db.js";
import Product from "./models/product.model.js"; 
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';

// Import passport y session
import passport from 'passport';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import __dirname from './utils.js';
import dotenv from 'dotenv'
import initializePassport from './config/passport.config.js';

// Inicializo Express
const app = express();
dotenv.config() // Esto es para las variables de entorno

//JSON settings:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/public'));

//Cookies
//router.use(cookieParser());
app.use(cookieParser("CoderS3cr3tC0d3"));

// Configurar express-session
app.use(
    session({
        secret: "miClaveSecreta",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URL,
            ttl: 3600,
        }),
        cookie: { maxAge: 60000 },
    })
);

// Configuración de Passport
initializePassport(); // <- Ejecución de la configuración
app.use(passport.initialize());
app.use(passport.session()); // <- Asegúrate de que esto esté después de express-session

// Endpoints
app.use("/api/products", productsRouter);
app.use("/api/carts", cartRouter);
app.use("/", viewsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/users', usersViewRouter);
app.use("/api/sessions", sessionsRouter); // <- Es donde estan las APIs de register y Login

// Middleware para procesar datos codificados en URL (opcional, si usas formularios)
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server);


// Me conecto con MongoDB
connectMongoDB();

// Puerto
const PORT = 8080;

// Habilitamos la carpeta public
app.use(express.static("public"));



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