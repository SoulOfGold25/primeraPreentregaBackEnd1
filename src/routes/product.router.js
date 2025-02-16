import express from "express";
import ProductManager  from "../ProductManager.js";

//Inicio el router de express para manejar rutas
const productsRouter = express.Router();
//instanciamos el manejador de nuestro archivo de productos
const productManager = new ProductManager("./src/data/product.json");

//GET "/"
productsRouter.get("/", async(req, res)=>{
    try {
        //Recuperamos los productos de nuestro archivo products.json
        const data = await productManager.getProduct();
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send({message: error.message});
    }
})
//GET "/:pid"
productsRouter.get("/:pid", async(req, res)=>{
    try {
        const products = await productManager.getProductsById(req.params.pid);
        res.status(200).send(products);
    } catch (error) {
        res.status(500).send({message: error.message});
    }
})

//POST "/"

productsRouter.post("/", async (req, res)=>{
    try {
        const newProduct = req.body;
        const product = await productManager.addProduct(newProduct);
        res.status(201).send(product);
    } catch (error) {
        res.status(500).send({message: error.message});
    }
})

//PUT "/:pid"

productsRouter.put("/:pid", async (req, res)=>{
    try {
        const updateProduct = req.body;
        const products = await productManager.setProductsById(req.params.pid, updateProduct);
        res.status(200).send(products);
    } catch (error) {
        res.status(404).send({message: error.message});
    }
})

//DELETE "/:pid"

productsRouter.delete("/:pid", async (req, res)=>{
    try {
        const products = await productManager.deleteProductsById(req.params.pid);
        res.status(200).send({message: `Se acaba de eliminar el producto con id: ${req.params.pid}`});
    } catch (error) {
        res.status(404).send({message: error.message});
    }
})

export default productsRouter;