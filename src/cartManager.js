import fs from "fs";

class CartManager{
    constructor(pathFile){
        this. pathFile = pathFile;
    }

    // addCart

addCart = async () => {
    try {
        const fileData = await fs.promises.readFile(this.pathFile, "utf-8");
        const carts = JSON.parse(fileData);

        //ID autoincrementable 
        const newId = carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;

        //Creo nuevo carts
        const newCart = {
            id:newId,
            products: []
        };

        carts.push(newCart);
        await fs.promises.writeFile(this.pathFile, JSON.stringify(carts, null, 2), "utf-8");

        return carts;

    } catch (error) {
        throw new Error(`Error al crear nuevo carrito: ${error.message}`);
    }
}

// getCartById

getCartById = async (idCart) => {
    try {
        const fileData = await fs.promises.readFile(this.pathFile, "utf-8");
        const carts = JSON.parse(fileData);

        //Busco por Id
        const cart = carts.find(cart => cart.id === parseInt(idCart));
        if (!cart) throw new Error(`Cart no encontrado, revise el id: ${idCart}`);

        //Devuelvo los productos encontrados
        return cart.products;
    } catch (error) {
        throw new Error(`Cart no encontrado ${error.message}`);
    }
}

//addProductInCartById

addProductById = async (idCart, product) => {
    try {
        const fileData = await fs.promises.readFile(this.pathFile, "utf-8");
        const carts = JSON.parse(fileData);

        //Busco por Id
        const cart = carts.find(cart => cart.id === parseInt(idCart));
        if (!cart) throw new Error(`Cart no encontrado, revise el id: ${idCart}`);

        //aññado los product al cart
        cart.products.push(product);
    } catch (error) {
        throw new Error(`Cart no encontrado ${error.message}`);
    }
}
}

export default CartManager;