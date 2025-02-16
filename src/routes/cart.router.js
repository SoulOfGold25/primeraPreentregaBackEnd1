import express from "express";
import CartManager from "../CartManager.js"

const cartRouter = express.Router();
const cartManager = new CartManager("./src/data/cart.json");

//POST "/"

cartRouter.post("/", async (req, res)=>{
    try {
        const carts = await cartManager.addCart();
        res.status(201).send(carts);
    } catch (error) {
        res.status(500).send({message: error.message});
    }
})

//GET "/:cid"   traer los productos por id 
cartRouter.get("/:cid", async(req, res)=>{
    try {
        const cartProducts = await cartManager.getCartById(req.params.cid);
        res.status(200).send(cartProducts);
    } catch (error) {
        res.status(400).send({message: error.message});
    }
})


//POST "/:cid/product/:pid"

cartRouter.post("/:cid/product/:pid", async (req, res)=>{
    try {
        const {quantity} = req.body;
        const product = { id: parseInt(req.params,pid), quantity };
        const updatedCart = await cartManager.addProductInCartById(req,params.cid, product);
        res.status(201).send(updatedCart);
    } catch (error) {
        res.status(500).send({message: error.message});
    }
})

export default cartRouter;