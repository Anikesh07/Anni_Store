const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/anni";

async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: true
    });

    console.log("✅ MongoDB connected:", MONGO_URI);
  } catch (err) {
    console.error("❌ MongoDB connection error");
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = connectMongo;
