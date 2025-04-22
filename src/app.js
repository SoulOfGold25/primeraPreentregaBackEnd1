// ----------------- IMPORTS -----------------
import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";
import passport from "passport";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Utils
import __dirname from "./utils.js";
import initializePassport from "./config/passport.config.js";
import connectMongoDB from "./data/db.js";

// Routes
import productsRouter from './routes/product.router.js';
import cartRouter from './routes/cart.router.js';
import viewsRouter from './routes/views.router.js';
import sessionsRouter from './routes/sessions.router.js';

// Models
import Product from './dao/models/product.model.js';

// ----------------- APP SETUP -----------------
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// ----------------- MIDDLEWARES -----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("CoderS3cr3tC0d3"));

app.use(session({
    secret: "miClaveSecreta",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        ttl: 3600
    }),
    cookie: { maxAge: 60000 }
}));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// ----------------- HANDLEBARS -----------------
app.engine("handlebars", engine({
    helpers: {
      eq: (a, b) => a === b
    }
  }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

// ----------------- ROUTES -----------------
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartRouter);
app.use("/api/sessions", sessionsRouter);

// ----------------- WEBSOCKETS -----------------
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
    console.log("🔌 Nuevo usuario conectado");

    socket.on("getProducts", async () => {
        try {
            const products = await Product.find().lean();
            socket.emit("updateProducts", products);
        } catch (error) {
            console.error("Error al obtener productos:", error.message);
        }
    });

    socket.on("newProduct", async (productData) => {
        try {
            const newProduct = new Product(productData);
            await newProduct.save();
            const products = await Product.find().lean();
            io.emit("updateProducts", products);
        } catch (error) {
            console.error("Error al añadir producto:", error.message);
        }
    });

    socket.on("deleteProductById", async (id) => {
        try {
            await Product.findByIdAndDelete(id);
            const products = await Product.find().lean();
            io.emit("updateProducts", products);
        } catch (error) {
            console.error("Error al eliminar producto:", error.message);
        }
    });
});

// ----------------- START -----------------
connectMongoDB();

server.listen(PORT, () => {
    console.log(`✅ Servidor iniciado en: http://localhost:${PORT}`);
});
