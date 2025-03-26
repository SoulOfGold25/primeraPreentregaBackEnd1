import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Defino el esquema de usuario
const userSchema = new mongoose.Schema({
    first_name: { 
        type: String, 
        required: true },
    last_name: { 
        type: String, 
        required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true },
    age: { 
        type: Number, 
        required: true },
    password: { 
        type: String, 
        required: true },
    cart: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Carts' },
    role: { 
        type: String, 
        default: 'user' }
});

// Middleware para encriptar la contraseña
userSchema.pre('save', function(next) {
    if (this.isModified('password')) {
        this.password = bcrypt.hashSync(this.password, 10);
    }
    next();
});

// Creo el modelo de usuario
const User = mongoose.model('User', userSchema);

// Exporto el modelo
export default User;