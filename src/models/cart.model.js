import mongoose, { mongo } from "mongoose";


const cartSchema = new mongoose.Schema({
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Referencia al producto
        quantity: { type: Number, required: true, default: 1 }
    }]
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;