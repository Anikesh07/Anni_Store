const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    /* -------------------------
       CORE PRODUCT INFO
    -------------------------- */
    title: {
      type: String,
      required: true,
      trim: true,
      index: "text"
    },

    description: {
      type: String,
      default: "",
      trim: true,
      index: "text"
    },

    /* -------------------------
       CATEGORY
    -------------------------- */
    category: {
      type: String,
      default: "uncategorized",
      lowercase: true,
      trim: true,
      index: true
    },

    /* -------------------------
       PRICING & INVENTORY
    -------------------------- */
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },

    stock: {
      type: Number,
      default: 0,
      min: 0
    },

    /* -------------------------
       RATINGS
    -------------------------- */
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: 0
    },

    /* -------------------------
       IMAGE (ADMIN UPLOAD)
    -------------------------- */
    image: {
      type: String,
      required: true
    },

    /* -------------------------
       SOURCE TRACKING
    -------------------------- */
    source: {
      type: String,
      enum: ["FakeStore", "DummyJSON", "Manual"],
      default: "Manual"
    }
  },
  {
    timestamps: true
  }
);

/* -------------------------
   ENSURE CATEGORY NEVER EMPTY
-------------------------- */
ProductSchema.pre("save", function (next) {
  if (!this.category || this.category.trim() === "") {
    this.category = "uncategorized";
  }
  next();
});

/* -------------------------
   SEARCH INDEX
-------------------------- */
ProductSchema.index(
  {
    title: "text",
    description: "text",
    category: "text"
  },
  {
    weights: {
      title: 5,
      category: 3,
      description: 1
    }
  }
);

module.exports = mongoose.model("Product", ProductSchema);