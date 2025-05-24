import { Router } from "express";
import { passportCall, authorization } from "../utils.js";
import ProductDAO from '../dao/product.dao.js';
const productManager = new ProductDAO();
import CartModel from '../dao/models/cart.model.js';
const router = Router();

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

// Perfil de User
router.get("/", passportCall("jwt"), (req, res) => {
  res.render("profile", {
    user: req.user, //->Habilitar para JWT
  });
});

// Perfil del ADMIN
router.get(
  "/dashboard-admin",
  passportCall("jwt"),
  authorization("admin"),
  (req, res) => {
    res.render("admin", {
      user: req.user, //->Habilitar para JWT
    });
  }
);

router.get("/purchase/success", (req, res) => {
	if (!req.session.ticket) {
	  return res.redirect("/products");
	}
  
	res.render("purchaseSuccess", {
	  ticket: req.session.ticket,
	  purchasedProducts: req.session.purchasedProducts || [],
	  noStock: req.session.noStock || []
	});
  
	req.session.ticket = null;
	req.session.purchasedProducts = null;
	req.session.noStock = null;
  });
  

router.get('/products', async (req, res) => {
	try {
		const { limit = 10, page = 1, sort, query } = req.query;

		const result = await productManager.getProducts({ query }, { limit, page, sort });

		res.render('products', {
			products: result.payload,
			page: result.page,
			totalPages: result.totalPages,
			hasPrevPage: result.hasPrevPage,
			hasNextPage: result.hasNextPage,
			prevLink: result.prevLink,
			nextLink: result.nextLink,
			sort,
			query,
			availableOnly: query === 'available'
		});
	} catch (error) {
		res.status(500).send("Error al cargar productos");
	}
});

router.get('/carts/:cid', async (req, res) => {
	try {
		const { cid } = req.params;

		const cart = await CartModel.findById(cid).populate('products.product').lean();

		if (!cart) {
			return res.status(404).render('error', { message: 'Carrito no encontrado' });
		}

		const total = cart.products.reduce((acc, p) => acc + p.quantity * p.product.price, 0);

		res.render('cart', {
			cartId: cart._id,
			products: cart.products,
			total: total.toFixed(2)
		});
	} catch (error) {
		console.error(error);
		res.status(500).send('Error al cargar el carrito');
	}
});

export default router;
