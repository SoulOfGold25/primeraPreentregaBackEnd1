import Cart from './models/cart.model.js';

class CartManager {
    constructor() {}

    // Crear un nuevo carrito
    addCart = async () => {
        try {
            const newCart = new Cart({ products: [] });
            await newCart.save();
            return newCart;
        } catch (error) {
            throw new Error(`Error al crear un nuevo carrito: ${error.message}`);
        }
    };

    // Obtener un carrito por ID
    getCartById = async (idCart) => {
        try {
            const cart = await Cart.findById(idCart).populate('products.product');
            if (!cart) throw new Error(`Carrito no encontrado con el id: ${idCart}`);
            return cart;
        } catch (error) {
            throw new Error(`Error al obtener el carrito: ${error.message}`);
        }
    };

    // Agregar un producto a un carrito
    addProductById = async (idCart, productId, quantity) => {
        try {
            const cart = await Cart.findById(idCart);
            if (!cart) throw new Error(`Carrito no encontrado con el id: ${idCart}`);

            // Verificar si el producto ya existe en el carrito
            const productIndex = cart.products.findIndex(p => p.product.toString() === productId);

            if (productIndex !== -1) {
                // Si el producto ya existe, actualizamos la cantidad
                cart.products[productIndex].quantity += quantity;
            } else {
                // Si el producto no existe, lo agregamos al carrito
                cart.products.push({ product: productId, quantity });
            }

            await cart.save();
            return cart;
        } catch (error) {
            throw new Error(`Error al agregar el producto al carrito: ${error.message}`);
        }
    };

    // Eliminar un producto de un carrito
    removeProductById = async (idCart, productId) => {
        try {
            const cart = await Cart.findById(idCart);
            if (!cart) throw new Error(`Carrito no encontrado con el id: ${idCart}`);

            // Filtrar los productos para eliminar el producto especificado
            cart.products = cart.products.filter(p => p.product.toString() !== productId);

            await cart.save();
            return cart;
        } catch (error) {
            throw new Error(`Error al eliminar el producto del carrito: ${error.message}`);
        }
    };

    // Vaciar un carrito
    clearCart = async (idCart) => {
        try {
            const cart = await Cart.findByIdAndUpdate(idCart, { products: [] }, { new: true });
            if (!cart) throw new Error(`Carrito no encontrado con el id: ${idCart}`);
            return cart;
        } catch (error) {
            throw new Error(`Error al vaciar el carrito: ${error.message}`);
        }
    };

    // Obtener el último carrito creado
    getLatestCart = async () => {
        try {
            const lastCart = await Cart.findOne().sort({ _id: -1 });
            return lastCart;
        } catch (error) {
            throw new Error(`Error al obtener el último carrito: ${error.message}`);
        }
    };

    // Actualizar los productos del carrito
    updateCartProducts = async (idCart, products) => {
        try {
            if (!products || !Array.isArray(products)) {
                throw new Error("El cuerpo de la solicitud debe contener un arreglo de productos.");
            }

            const cart = await Cart.findByIdAndUpdate(idCart, { products }, { new: true }).populate('products.product');
            if (!cart) throw new Error(`Carrito no encontrado con el id: ${idCart}`);
            return cart;
        } catch (error) {
            throw new Error(`Error al actualizar los productos del carrito: ${error.message}`);
        }
    };

    // Actualizar la cantidad de un producto en el carrito
    updateProductQuantity = async (idCart, productId, quantity) => {
        try {
            if (quantity <= 0) throw new Error("La cantidad debe ser mayor que 0");

            const cart = await Cart.findById(idCart);
            if (!cart) throw new Error(`Carrito no encontrado con el id: ${idCart}`);

            const productInCart = cart.products.find(item => item.product.toString() === productId);
            if (!productInCart) throw new Error("Producto no encontrado en el carrito");

            productInCart.quantity = quantity;
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error(`Error al actualizar la cantidad del producto: ${error.message}`);
        }
    };
}

export default CartManager;