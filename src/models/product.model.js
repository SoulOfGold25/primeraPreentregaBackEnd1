import mongoose, { mongo } from "mongoose";
import paginate from "mongoose-paginate-v2";


const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    code: String,
    price: Number,
    status: Boolean,
    stock: Number,
    category: String,
    thumbnails: []
});


productSchema.plugin(paginate);

const Product = mongoose.model("Product", productSchema);

export default Product;

