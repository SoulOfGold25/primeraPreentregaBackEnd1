import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { generateJWToken } from '../utils.js';

export const register = async (req, res) => {
    try {
        const { first_name, last_name, email, age, password, cart, role } = req.body;
        const newUser = new User({ first_name, last_name, email, age, password, cart, role });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = generateJWToken(user);
        res.cookie("jwtCookieToken", token, {
            maxAge: 60000,
            httpOnly: true
        });
        res.json({ token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const current = (req, res) => {
    res.json(req.user);
};