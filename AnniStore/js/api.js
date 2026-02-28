/* ================== DB API CONFIG ================== */

const API_BASE = "http://localhost:4000";

/* ================== CACHE ================== */

let PRODUCT_CACHE = null;

/* ================== LOADER HOOKS ================== */

function apiStart() {
  if (typeof startLoader === "function") startLoader();
}

function apiEnd() {
  if (typeof endLoader === "function") endLoader();
}

function apiError() {
  if (typeof showNetError === "function") showNetError();
}

/* ================== HELPERS ================== */

function normalizeProduct(p) {
  return {
    id: p._id,
    title: p.title,
    price: p.price,
    description: p.description || "",
    category: p.category,
    image: p.image,
    stock: p.stock,
    rating: {
      rate: p.rating || 0,
      count: p.ratingCount || 0
    },
    source: p.source
  };
}

/* ================== API FUNCTIONS ================== */

async function getProducts() {
  if (PRODUCT_CACHE) return PRODUCT_CACHE;

  apiStart();

  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error("DB API failed");

    const data = await res.json();
    PRODUCT_CACHE = data.map(normalizeProduct);
    return PRODUCT_CACHE;

  } catch (err) {
    console.error("API Error:", err);
    apiError();
    return [];
  } finally {
    apiEnd();
  }
}

async function getCategories() {
  const products = await getProducts();
  return [...new Set(products.map(p => p.category))];
}

async function getProduct(id) {
  const products = await getProducts();
  return products.find(p => String(p.id) === String(id));
}

async function searchProducts(q) {
  apiStart();
  try {
    const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    return data.map(normalizeProduct);
  } finally {
    apiEnd();
  }
}

async function getTopProducts(category, limit = 5) {
  apiStart();
  try {
    const url = `${API_BASE}/products/top?category=${category}&limit=${limit}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.map(normalizeProduct);
  } finally {
    apiEnd();
  }
}


function clearProductCache() {
  PRODUCT_CACHE = null;
}

clearProductCache();