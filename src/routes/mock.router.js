import express from 'express';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

import userModel from '../dao/models/user.model.js';
import petModel from '../dao/models/pet.model.js';

const router = express.Router();

// funcion para crear usuario falso
const generateUser = async () => {
    return{
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        age: faker.number.int({ min: 18, max: 80 }),
        password: await bcrypt.hash("coder123", 10),
        role: faker.helpers.arrayElement(['user', 'admin']),
        pets: []
    }
}

// funcion para crear mascota falsa
const generatePet = () => {
    return {
        name: faker.animal.dog(), //puedo cambiar a cat, horse, etc
        species: faker.animal.type(),
        age: faker.number.int({ min: 1, max: 15 }),
        adopted: faker.datatype.boolean(),
    };
};

// ruta get para obtener una lista de mascotas falsas
router.get("/mockingpets", (req, res)=>{
    const pets = [];
    for (let i = 0; i < 50; i++) {
        pets.push(generatePet());
    }
    res.status(200).json({ status: "success", payload: pets });
});

// ruta get para obtener un usuario falso
router.get("/mockingusers", async (req, res) => {
    const users = [];
    for (let i = 0; i < 50; i++) {
        const user = await generateUser();
        users.push(user);
    }
    res.status(200).json({ status: "success", payload: users });
});

// Endpoint POST /generateData
router.post("/generateData", async (req, res) => {
    const {users = 0, pets = 0} = req.body;

    try {
        //generar usuarios falsos
        const userPromises = [];
        for (let i = 0; i < users; i++) {
            userPromises.push(generateUser());
        }

        const userToInsert = await Promise.all(userPromises);
        await userModel.insertMany(userToInsert);

        //generar mascotas falsas
        const petsToInsert = [];
        for (let i = 0; i < pets; i++) {
            petsToInsert.push(generatePet());
        }
        await petModel.insertMany(petsToInsert);
        res.status(200).json({ status: "success", message: `${users} users and ${pets} pets inserted successfully` });


    } catch (error) {
        res.status(500).json({ status: "error", message: "Error generating data", error: error.message });
    } 

});


export default router;