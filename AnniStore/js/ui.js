/* =========================
   CART HELPERS (FIXED)
   ========================= */

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(p) {
  const cart = getCart();
  const item = cart.find(i => String(i.id) === String(p.id));

  if (item) {
    item.qty++;
  } else {
    cart.push({
      id: p.id,
      product: p,
      qty: 1
    });
  }

  saveCart(cart);
  updateBadges();
}

function isInCart(id) {
  const cart = getCart();
  return cart.some(i => String(i.id) === String(id));
}

function removeFromCart(id) {
  const cart = getCart().filter(i => String(i.id) !== String(id));
  saveCart(cart);
  updateBadges();
}

/* =========================
   WISHLIST HELPERS (FIXED)
   ========================= */

function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist") || "[]");
}

function isInWishlist(id) {
  const w = getWishlist();
  return w.some(x => String(x.id) === String(id));
}

function toggleWish(p) {
  let w = getWishlist();

  if (isInWishlist(p.id)) {
    w = w.filter(x => String(x.id) !== String(p.id));
  } else {
    w.push(p);
  }

  localStorage.setItem("wishlist", JSON.stringify(w));
  updateBadges();
}

function updateWishIcon(el, id) {
  if (!el) return;

  if (isInWishlist(id)) {
    el.textContent = "❤️";
    el.classList.add("wish-active");
  } else {
    el.textContent = "🤍";
    el.classList.remove("wish-active");
  }
}

/* =========================
   BADGES (CART + WISHLIST)
   ========================= */

function updateBadges() {
  const cart = getCart();
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const wishCount = getWishlist().length;

  document.querySelectorAll("#cartCount").forEach(e => {
    e.textContent = cartCount;
  });

  document.querySelectorAll("#wishCount").forEach(e => {
    e.textContent = wishCount;
  });
}

/* =========================
   INIT
   ========================= */

updateBadges();

/* =========================
   BOT UI (UNCHANGED)
   ========================= */

const botLauncher = document.getElementById("anniBotLauncher");
const botBox = document.getElementById("anniBotBox");
const botClose = document.getElementById("closeAnniBot");

if (botLauncher && botBox && botClose) {
  botLauncher.onclick = () => {
    botBox.classList.toggle("hidden");
  };

  botClose.onclick = () => {
    botBox.classList.add("hidden");
  };
}
