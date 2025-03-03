import express from "express";
import ProductManager from "../ProductManager.js";

const viewsRouter = express.Router();
const productsManager = new ProductManager("./src/data/products.json");

viewsRouter.get("/", async (req, res)=>{
    try {
        const products = await productsManager.getProduct();
        res.render("home", {products});
    } catch (error) {
        res.status(500).send({message: error.message})
    }

})

viewsRouter.get("/realtimeproducts", async (req, res)=>{
    try {
        const products = await productsManager.getProduct();
        res.render("realTimeProducts", {products});
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})

export default viewsRouter;