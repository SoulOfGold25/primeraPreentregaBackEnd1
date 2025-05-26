import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

export const generateUser = async() => {
    const rawPassword = "coder123";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    return{
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        age: faker.number.int({ min: 18, max: 80 }),
        password: hashedPassword,
        role: faker.helpers.arrayElement(["user", "admin"]),
        pets:[],
    };
};
