import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product", // Referencia al modelo de productos
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
            },
        },
    ],
});

const Cart = mongoose.model("Carts", cartSchema);

export default Cart;