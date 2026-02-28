/**
 * PRODUCT SERVICE
 * ---------------------------------------
 * Handles:
 *  - CRUD operations
 *  - Filtering
 *  - Search
 *  - Smart selection
 */

const Product = require("../models/product.model");

/* =====================================
   FILTER BUILDER
===================================== */
function buildFilter({ category, minPrice, maxPrice, keyword }) {
  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (keyword) {
    filter.$text = { $search: keyword };
  }

  return filter;
}

/* =====================================
   CREATE
===================================== */
async function createProduct(data) {
  const product = new Product(data);
  return product.save();
}

/* =====================================
   READ
===================================== */
async function getAllProducts(options = {}) {
  const filter = buildFilter(options);

  return Product.find(filter).sort({ createdAt: -1 });
}

async function getProductById(id) {
  return Product.findById(id);
}

async function getByCategory(category, options = {}) {
  const filter = buildFilter({ category, ...options });

  return Product.find(filter).sort({ rating: -1 });
}

async function searchProducts(keyword = "", options = {}) {
  const filter = buildFilter({ keyword, ...options });

  return Product.find(filter).sort({ rating: -1 });
}

async function getTopProducts({
  category,
  limit = 5,
  minPrice,
  maxPrice
} = {}) {
  const filter = buildFilter({ category, minPrice, maxPrice });

  return Product.find(filter)
    .sort({ rating: -1, ratingCount: -1 })
    .limit(limit);
}

async function getBestProduct({
  category,
  budget
} = {}) {
  const filter = buildFilter({
    category,
    maxPrice: budget
  });

  return Product.find(filter)
    .sort({
      rating: -1,
      ratingCount: -1,
      price: 1
    })
    .limit(1);
}

async function compareProducts(names = []) {
  if (!names.length) return [];

  return Product.find({
    title: {
      $in: names.map(n => new RegExp(n, "i"))
    }
  });
}

/* =====================================
   UPDATE
===================================== */
async function updateProduct(id, data) {
  return Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
}

/* =====================================
   DELETE
===================================== */
async function deleteProduct(id) {
  return Product.findByIdAndDelete(id);
}

/* =====================================
   EXPORTS
===================================== */
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getByCategory,
  searchProducts,
  getTopProducts,
  getBestProduct,
  compareProducts,
  updateProduct,
  deleteProduct
};