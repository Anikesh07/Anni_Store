const axios = require("axios");
const connectMongo = require("../config/db");
const Product = require("../models/product.model");


const FAKE_API = "https://fakestoreapi.com/products";
const DUMMY_API = "https://dummyjson.com/products?limit=200";

async function importProducts() {
  await connectMongo();

  console.log("🧹 Clearing old products...");
  await Product.deleteMany({});

  let products = [];

  // FakeStore
  const fakeRes = await axios.get(FAKE_API);
  fakeRes.data.forEach(p => {
    products.push({
      title: p.title,
      description: p.description,
      category: p.category,
      price: p.price,
      stock: 20,
      rating: p.rating?.rate || 0,
      ratingCount: p.rating?.count || 0,
      image: p.image,
      source: "FakeStore"
    });
  });

  // DummyJSON
  const dummyRes = await axios.get(DUMMY_API);
  dummyRes.data.products.forEach(p => {
    products.push({
      title: p.title,
      description: p.description,
      category: p.category,
      price: p.price,
      stock: p.stock,
      rating: p.rating,
      ratingCount: 0,
      image: p.thumbnail,
      source: "DummyJSON"
    });
  });

  await Product.insertMany(products);
  console.log(`✅ Imported ${products.length} products`);

  process.exit();
}

importProducts();
