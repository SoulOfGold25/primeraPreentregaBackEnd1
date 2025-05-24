import express from "express";
import ProductManager from "../dao/product.dao.js";
import { checkRole } from '../middlewares/authorization.js';


// Inicio el router de express para manejar rutas
const productsRouter = express.Router();

// Instanciamos el manejador de productos
const productManager = new ProductManager();

// GET "/": Obtener todos los productos con filtros, paginación y ordenamiento
productsRouter.get("/", async (req, res) => {
	try {
		const { limit, page, sort, query } = req.query;
		const options = { limit, page, sort };
		const products = await productManager.getProducts({ query }, options);
		res.status(200).json(products);
	} catch (error) {
		res.status(500).json({ status: "error", message: error.message });
	}
});

// GET "/:pid": Obtener un producto por ID
productsRouter.get("/:pid", async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        res.status(200).send(product);
    } catch (error) {
        res.status(404).send({ status: "error", message: error.message });
    }
});

// // POST "/": Crear un nuevo producto
// productsRouter.post("/", async (req, res) => {
//     try {
//         const newProduct = req.body;
//         const product = await productManager.addProduct(newProduct);
//         res.status(201).send(product);
//     } catch (error) {
//         res.status(500).send({ status: "error", message: error.message });
//     }
// });

// PUT "/:pid": Actualizar un producto por ID
// productsRouter.put("/:pid", async (req, res) => {
//     try {
//         const updateProduct = req.body;
//         const product = await productManager.updateProduct(req.params.pid, updateProduct);
//         res.status(200).send(product);
//     } catch (error) {
//         res.status(404).send({ status: "error", message: error.message });
//     }
// });

// DELETE "/:pid": Eliminar un producto por ID
// productsRouter.delete("/:pid", async (req, res) => {
//     try {
//         await productManager.deleteProduct(req.params.pid);
//         res.status(200).send({ message: `Se eliminó el producto con id: ${req.params.pid}` });
//     } catch (error) {
//         res.status(404).send({ status: "error", message: error.message });
//     }
// });

// Solo ADMIN puede crear productos
productsRouter.post("/", checkRole("admin"), async (req, res) => {
    // crear producto...
  });
  
  // Solo ADMIN puede actualizar/eliminar
  productsRouter.put("/:pid", checkRole("admin"), /* ... */);
  productsRouter.delete("/:pid", checkRole("admin"), /* ... */);



export default productsRouter;