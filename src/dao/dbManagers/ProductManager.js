const ProductsModel = require("../../models/products");

class ProductManager {
  async getProducts(limit = 10, page = 1, query = "", sort = "") {
    const sortOrder = (sort = "asc" ? 1 : -1);
    const { docs, ...rest } = await ProductsModel.paginate(
      {},
      { limit: limit, page: page, lean: true }
    );
    const products = docs;
    let nextLink = rest.hasNextPage ? `/?page=${rest.nextPage}` : null;
    let prevLink = rest.hasPrevPage ? `/?page=${rest.prevPage}` : null;

    return { products, rest, nextLink, prevLink };
  }

  async getProductById(id) {
    const product = await ProductsModel.find({ _id: id }).lean();
    return product[0];
  }

  async addProduct(product) {
    await ProductsModel.create(product);
  }

  async updateProduct(id, updatedProduct) {
    await ProductsModel.updateOne({ _id: id }, updatedProduct);
  }

  async deleteProduct(id) {
    await ProductsModel.deleteOne({ _id: id });
  }
}

module.exports = ProductManager;