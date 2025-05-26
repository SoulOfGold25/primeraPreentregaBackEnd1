import express from 'express';
import userModel from '../dao/models/user.model.js';

const router = express.Router();

// Endpoint GET /users
router.get("/", async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json({ status: "success", payload: users });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
})

export default router;