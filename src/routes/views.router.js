import express from "express";
import ProductManager from "../ProductManager.js";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js"

const viewsRouter = express.Router();
const productsManager = new ProductManager("./src/data/products.json");

viewsRouter.get("/", async(req, res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        //Campo por el cual ordenar
        const sortBy = req.query.sortBy || "price"; 
        //Ascendente (1) o Descendente (-1)
        const sortOrder = req.query.sortOrder === "desc" ? -1 : 1; 
        //Query para aplicar filtro y lo convierto en booleano
        const availableOnly = req.query.available === "true"
        //Si available es verdadero  filtrara por status verdadero
        const filter = availableOnly ? {status:true} : {}

        const products = await Product.paginate(
            filter, 
            {   
                limit, 
                page,
                //Aplico el orden 
                sort: {
                    [sortBy]: sortOrder
                },
                lean: true 
            }
        );
        
        //modifico el res para mantener los filtros desde handlebars
        res.render("home", {...products, sortBy, sortOrder, availableOnly});
    } catch (error) {
        res.status(500).send({status: "error", message: message.error});
    }
})

// Ruta para ver los detalles del producto
viewsRouter.get("/products/:pid", async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid).lean();

        if (!product) {
            return res.status(404).send("Producto no encontrado");
        }

        // Renderizar vista con los detalles del producto
        res.render("productDetail", { product });
    } catch (error) {
        res.status(500).send("Error al obtener los detalles del producto");
    }
});


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

// Ruta para ver los detalles del carrito
viewsRouter.get("/carts/:cid", async (req, res) => {
    try {
        // Busca el carrito por su ID
        const cart = await Cart.findById(req.params.cid).populate('products.product').lean();

        // Si no se encuentra el carrito, retornar error 404
        if (!cart) {
            return res.status(404).send("Carrito no encontrado");
        }

        // Renderiza la vista con los detalles del carrito
        res.render("cart", { cart });
    } catch (error) {
        res.status(500).send("Error al obtener los detalles del carrito");
    }
});


export default viewsRouter;