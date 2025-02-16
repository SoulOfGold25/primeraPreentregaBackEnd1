const socket = io();

const formNewProduct = document.getElementById("formNewProducts");

formNewProduct.addEventListener("submit", (event)=>{
    event.preventDefault();

    const formData = new FormData(formNewProduct);
    const productData = {};

    formData.forEach((value, key)=>{
        productData[key] = value;
    })

    //enviar los datos del producto al servidor 
    socket.emit("newProduct", productData);
});

socket.on("productAdded", (newProduct)=>{
    const productsList = document.getElementById("productsList");

    productsList.innerHTML += `<li>${newProduct.title} - ${newProduct.price}</li>`;
});
