import mongoose, { mongo } from "mongoose";

const connectMongoDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://coder:coderpass@ecommerce-cluster.tmavn.mongodb.net/fampRepuestos?retryWrites=true&w=majority&appName=ecommerce-cluster");
        console.log("Conectado con MongoDB");
    } catch (error) {
        console.log("Error al conectar con base de datos" + error);
    }
}

export default connectMongoDB;