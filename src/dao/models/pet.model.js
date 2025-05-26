import mongoose from 'mongoose';

const collection = "pets";

const petSchema = new mongoose.Schema({
    name: String,
    species: String,
    age: Number,
    adopted: Boolean
});

const PetModel = mongoose.model(collection, petSchema);
export default PetModel;