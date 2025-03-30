import Product from './models/product.model.js';

class ProductManager {
    constructor() {}

    // Crear un nuevo producto
    addProduct = async (productData) => {
        try {
            const { title, description, code, price, stock, category } = productData;

            // Validar que los campos requeridos estén presentes
            if (!title || !description || !code || !price || !stock || !category) {
                throw new Error('Todos los campos requeridos deben estar presentes');
            }

            // Validar que el código sea único
            const existingProduct = await Product.findOne({ code });
            if (existingProduct) {
                throw new Error(`El código "${code}" ya está en uso`);
            }

            const newProduct = new Product(productData);
            await newProduct.save();
            return newProduct;
        } catch (error) {
            throw new Error(`Error al crear el producto: ${error.message}`);
        }
    };

    // Obtener todos los productos con filtros, paginación y ordenamiento
    getProducts = async (query = {}, options = {}) => {
        try {
            const { limit = 10, page = 1, sort, ...filters } = options;

            const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};
            const products = await Product.paginate(filters, {
                limit: parseInt(limit),
                page: parseInt(page),
                sort: sortOption
            });

            return {
                status: 'success',
                payload: products.docs,
                totalPages: products.totalPages,
                prevPage: products.prevPage,
                nextPage: products.nextPage,
                page: products.page,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevLink: products.hasPrevPage ? `/api/products?page=${products.prevPage}` : null,
                nextLink: products.hasNextPage ? `/api/products?page=${products.nextPage}` : null
            };
        } catch (error) {
            throw new Error(`Error al obtener los productos: ${error.message}`);
        }
    };

    // Obtener un producto por ID
    getProductById = async (id) => {
        try {
            const product = await Product.findById(id);
            if (!product) throw new Error(`Producto no encontrado con el id: ${id}`);
            return product;
        } catch (error) {
            throw new Error(`Error al obtener el producto: ${error.message}`);
        }
    };

    // Actualizar un producto por ID
    updateProduct = async (id, productData) => {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true });
            if (!updatedProduct) throw new Error(`Producto no encontrado con el id: ${id}`);
            return updatedProduct;
        } catch (error) {
            throw new Error(`Error al actualizar el producto: ${error.message}`);
        }
    };

    // Eliminar un producto por ID
    deleteProduct = async (id) => {
        try {
            const deletedProduct = await Product.findByIdAndDelete(id);
            if (!deletedProduct) throw new Error(`Producto no encontrado con el id: ${id}`);
            return deletedProduct;
        } catch (error) {
            throw new Error(`Error al eliminar el producto: ${error.message}`);
        }
    };
}

export default ProductManager;