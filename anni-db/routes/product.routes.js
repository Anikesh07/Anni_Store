/**
 * PRODUCT ROUTES
 * -----------------------------------------
 * Public:
 *   - View products
 *   - Search
 *   - Filter
 *
 * Protected (website_admin only):
 *   - Create product
 *   - Update product
 *   - Delete product
 */

const express = require("express");
const router = express.Router();
const service = require("../services/product.service");
const multer = require("multer");
const path = require("path");

const authMiddleware = require("../services/auth.middleware");
const roleMiddleware = require("../services/role.middleware");

/* =====================================================
   IMAGE UPLOAD CONFIGURATION (PNG ONLY)
===================================================== */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products");
  },
  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "image/png") {
      return cb(new Error("Only PNG images are allowed"));
    }
    cb(null, true);
  }
});

/* =====================================================
   PUBLIC ROUTES (Accessible by everyone)
===================================================== */

/**
 * GET /products
 * Supports:
 *  - pagination
 *  - category filter
 *  - keyword search
 */
router.get("/", async (req, res) => {
  try {
    const { page, limit, category, q } = req.query;

    const products = await service.getAllProducts({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      category,
      keyword: q
    });

    res.json(products);
  } catch {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/**
 * GET /products/category/:category
 */
router.get("/category/:category", async (req, res) => {
  try {
    const products = await service.getByCategory(req.params.category);
    res.json(products);
  } catch {
    res.status(500).json({ error: "Failed to fetch category products" });
  }
});

/**
 * GET /products/search?q=iphone
 */
router.get("/search", async (req, res) => {
  try {
    const products = await service.searchProducts(req.query.q || "");
    res.json(products);
  } catch {
    res.status(500).json({ error: "Search failed" });
  }
});

/**
 * GET /products/top
 */
router.get("/top", async (req, res) => {
  try {
    const products = await service.getTopProducts({
      category: req.query.category,
      limit: Number(req.query.limit) || 5,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice
    });

    res.json(products);
  } catch {
    res.status(500).json({ error: "Failed to fetch top products" });
  }
});

/**
 * GET /products/best
 */
router.get("/best", async (req, res) => {
  try {
    const product = await service.getBestProduct({
      category: req.query.category,
      budget: req.query.budget
    });

    res.json(product[0] || {});
  } catch {
    res.status(500).json({ error: "Failed to fetch best product" });
  }
});

/**
 * GET /products/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await service.getProductById(req.params.id);

    if (!product)
      return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch {
    res.status(400).json({ error: "Invalid product ID" });
  }
});

/* =====================================================
   ADMIN ROUTES (Protected - website_admin only)
===================================================== */

/**
 * POST /products
 * Create new product
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["website_admin"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const product = await service.createProduct({
        ...req.body,
        image: req.file
          ? `/uploads/products/${req.file.filename}`
          : null,
        source: "Manual"
      });

      res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * PUT /products/:id
 * Update existing product
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["website_admin"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const data = { ...req.body };

      if (req.file) {
        data.image = `/uploads/products/${req.file.filename}`;
      }

      const product = await service.updateProduct(req.params.id, data);

      if (!product)
        return res.status(404).json({ error: "Product not found" });

      res.json(product);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * DELETE /products/:id
 * Remove product
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["website_admin"]),
  async (req, res) => {
    try {
      const product = await service.deleteProduct(req.params.id);

      if (!product)
        return res.status(404).json({ error: "Product not found" });

      res.json({ message: "Product deleted successfully" });
    } catch {
      res.status(400).json({ error: "Invalid product ID" });
    }
  }
);

module.exports = router;