import express from 'express';
import petModel from '../dao/models/pet.model.js';

const router = express.Router();
// Endpoint GET /pets
router.get("/", async (req, res) => {
    try {
        const pets = await petModel.find();
        res.status(200).json({ status: "success", payload: pets });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

export default router;