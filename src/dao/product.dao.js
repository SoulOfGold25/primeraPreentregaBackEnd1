import ProductModel from '../dao/models/product.model.js';
import mongoosePaginate from 'mongoose-paginate-v2';


export default class ProductDAO {
  async getProducts(queryParams = {}, options = {}) {
		const { limit = 10, page = 1, sort, ...filters } = options;

		// Filtro por categoría o disponibilidad
		const filter = {};
		if (queryParams.query) {
			if (queryParams.query === 'available') {
				filter.stock = { $gt: 0 };
			} else {
				filter.category = queryParams.query;
			}
		}

		// Orden por precio si sort es asc/desc
		const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : undefined;

		const result = await ProductModel.paginate(filter, {
			page: parseInt(page),
			limit: parseInt(limit),
			sort: sortOption,
			lean: true
		});

		return {
			status: "success",
			payload: result.docs,
			totalPages: result.totalPages,
			prevPage: result.prevPage,
			nextPage: result.nextPage,
			page: result.page,
			hasPrevPage: result.hasPrevPage,
			hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
      ? `/products?page=${result.prevPage}&limit=${limit}&sort=${sort || ''}&query=${queryParams.query || ''}`
      : null,
        nextLink: result.hasNextPage
      ? `/products?page=${result.nextPage}&limit=${limit}&sort=${sort || ''}&query=${queryParams.query || ''}`
      : null,
    
		};
	}

  async getById(id) {
    return await ProductModel.findById(id);
  }

  async create(product) {
    return await ProductModel.create(product);
  }

  async update(id, data) {
    return await ProductModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await ProductModel.findByIdAndDelete(id);
  }
}
