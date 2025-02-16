import fs from "fs";

class ProductManager{
    constructor(pathFile){
        this. pathFile = pathFile;
    }

    //getProducts
    getProduct = async() => {
        try {
            //leemos el archivo y guardamos su contenido
            const fileData = await fs.promises.readFile(this.pathFile, "utf-8");
            const data = JSON.parse(fileData);
            return data;
        } catch (error) {
            throw new Error(`Error al leer el archivo de productos ${error.message}`);
        }
    }

    //getProductsById

    getProductsById = async (idProduct) =>{
        try {
            //leo contenido del archivo JSON
            const fileData = await fs.promises.readFile(this.pathFile, "utf-8");
            const data = JSON.parse(fileData);
            const product = data.findIndex((prod) => prod.id === parseInt(idProduct)); 
            if (!product) throw new Error(`Producto no encontrado ¿El id: ${idProduct} es correcto?`);
            return product;
        } catch (error) {
            throw new Error(`Fallamos al obtener el producto ${error.message}`);
        }
    }

    //AddProduct
    addProduct = async (newProduct) => {
        try {
            const fileData = await fs.promises.readFile(this.pathFile, "utf-8");
            const data = JSON.parse(fileData);

            // Generar un nuevo ID basado en el último ID del array
            const newId = data.length > 0 ? data[data.length - 1].id + 1 : 1;
            const productToAdd = { id: newId, ...newProduct };

            data.push(productToAdd);
            await fs.promises.writeFile(this.pathFile, JSON.stringify(data, null, 2));

            return productToAdd;
        } catch (error) {
            throw new Error(`Error al agregar el producto: ${error.message}`);
        }
    }
    //setProductById
    setProductsById = async (idProduct, updatedProduct) => {
        try {
            const fileData = await fs.promises.readFile(this.pathFile, "utf-8");
            let data = JSON.parse(fileData);

            const productIndex = data.findIndex((prod) => prod.id === parseInt(idProduct));
            if (productIndex === -1) throw new Error(`Producto con ID ${idProduct} no encontrado.`);

            // Mantener el ID original y actualizar el resto de los campos
            data[productIndex] = { ...data[productIndex], ...updatedProduct };

            await fs.promises.writeFile(this.pathFile, JSON.stringify(data, null, 2));

            return data[productIndex];
        } catch (error) {
            throw new Error(`Error al actualizar el producto: ${error.message}`);
        }
    }
    //DeleteProductById

    deleteProductsById = async (idProduct) => {
        try {
            const fileData = await fs.promises.readFile(this.pathFile, "utf-8");
            let data = JSON.parse(fileData);

            const newData = data.filter((prod) => prod.id !== parseInt(idProduct));

            if (newData.length === data.length) throw new Error(`No se encontró el producto con ID ${idProduct}.`);

            await fs.promises.writeFile(this.pathFile, JSON.stringify(newData, null, 2));

            return `Producto con ID ${idProduct} eliminado correctamente.`;
        } catch (error) {
            throw new Error(`Error al eliminar el producto: ${error.message}`);
        }
    }

}

//Exportamos la clase
export default ProductManager;