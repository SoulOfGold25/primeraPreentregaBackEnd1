import mongoose from 'mongoose';

const collection = 'users';

const schema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: {
        type: String,
        unique: true
    },
    age: Number,
    password: String, // Aquí se almacenará el hash de la contraseña
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Carts' // Referencia al modelo Carts
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
});

const userModel = mongoose.model(collection, schema);

export default userModel;