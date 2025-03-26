import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import { generateJWToken } from '../utils.js';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Log para verificar los datos recibidos
        console.log('Datos recibidos para login:', { email, password });

        // Validar que ambos campos estén presentes
        if (!email || !password) {
            return res.status(400).send({ message: 'Todos los campos son obligatorios' });
        }

        // Buscar el usuario por correo
        const user = await User.findOne({ email });
        if (!user) {
            console.error('Usuario no encontrado:', email);
            return res.status(401).send({ message: 'Correo o contraseña inválidos' });
        }

        // Log para verificar la contraseña almacenada
        console.log('Contraseña almacenada (encriptada) recuperada de la base de datos:', user.password);

        // Verificar la contraseña de forma asíncrona
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Resultado de la comparación de contraseñas:', isPasswordValid);

        if (!isPasswordValid) {
            console.error('Contraseña inválida para el usuario:', email);
            return res.status(401).send({ message: 'Correo o contraseña inválidos' });
        }

        // Si todo es correcto, generar un token
        const token = generateJWToken(user);
        res.cookie('jwtCookieToken', token, { httpOnly: true });
        res.send({ message: 'Login exitoso' });
    } catch (error) {
        console.error('Error en el login:', error.message);
        res.status(500).send({ message: error.message });
    }
};

export const register = async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;

        // Validar que todos los campos estén presentes
        if (!first_name || !last_name || !email || !age || !password) {
            return res.status(400).send({ message: 'Todos los campos son obligatorios' });
        }

        // Log para verificar la contraseña en texto plano
        console.log('Contraseña en texto plano antes de encriptar:', password);

        // Encriptar la contraseña
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        console.log('Contraseña encriptada antes de guardar en la base de datos:', hashedPassword);

        // Crear el nuevo usuario
        const newUser = new User({ first_name, last_name, email, age, password: hashedPassword });
        await newUser.save();

        console.log('Usuario registrado exitosamente:', newUser);
        res.send({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error('Error en el registro:', error.message);
        res.status(500).send({ message: error.message });
    }
};

export const logout = (req, res) => {
    try {
        // Limpiar la cookie que contiene el token JWT
        res.clearCookie('jwtCookieToken');
        res.send({ message: 'Logout exitoso' });
    } catch (error) {
        console.error('Error en el logout:', error.message);
        res.status(500).send({ message: error.message });
    }
};

const storedPassword = '$2b$10$0V4lIRHkKWCbiKUx3rcjm.k3vVC.MksNoQBREE1TxZPrqJCKsiD9e'; // Contraseña encriptada
const inputPassword = '123'; // Contraseña ingresada

const isMatch = bcrypt.compareSync(inputPassword, storedPassword);
console.log('¿Las contraseñas coinciden?', isMatch);