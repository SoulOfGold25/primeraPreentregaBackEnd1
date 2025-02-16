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
    formNewProduct.reset();
});

// Capturar clic en el botón eliminar
productsList.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-btn")) {
        const productId = event.target.dataset.id;  // Obtener el ID del producto
        socket.emit("deleteProductById", productId);  // Enviar al servidor
    }
});

socket.on("productAdded", (newProduct)=>{
    const productsList = document.getElementById("productsList");

    // Crear un nuevo elemento <li> con botón de eliminar
    const li = document.createElement("li");
    li.innerHTML = `${newProduct.title} - ${newProduct.price} 
        <button class="delete-btn" data-id="${newProduct.id}">Eliminar</button>`;
    
    // Agregar el nuevo producto a la lista
    productsList.appendChild(li);
});

// Escuchar evento para actualizar la lista en tiempo real
socket.on("productDeleted", (updatedProducts) => {
    updateProductList(updatedProducts);
});

// Función para actualizar la lista de productos
function updateProductList(products) {
    productsList.innerHTML = ""; // Limpiar lista
    products.forEach(product => {
        const li = document.createElement("li");
        li.innerHTML = `${product.title} - ${product.price} 
            <button class="delete-btn" data-id="${product.id}">Eliminar</button>`;
        productsList.appendChild(li);
    });
}