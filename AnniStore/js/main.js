/* ================== SERVER CONFIG ================== */

const SERVER_BASE = "http://localhost:4000";

/* ================== GLOBAL STATE ================== */

let all = [];

/* ================== ELEMENTS ================== */

const grid = document.getElementById("productGrid");
const categoryBar = document.getElementById("categoryBar");
const search = document.getElementById("searchInput");
const sug = document.getElementById("suggestions");

/* ================== IMAGE RESOLVER ================== */

function resolveImage(image, id) {
  if (!image) {
    return `https://picsum.photos/seed/${id}/600/600`;
  }

  if (image.startsWith("http")) {
    return image;
  }

  return SERVER_BASE + image;
}

/* ================== SKELETON LOADER ================== */

function renderSkeletons(count = 9) {
  if (!grid) return;

  grid.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const d = document.createElement("div");
    d.className = "skeleton-card skeleton";

    d.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line small"></div>
      <div class="skeleton-line tiny"></div>
    `;

    grid.appendChild(d);
  }
}

/* ================== LOAD PRODUCTS ================== */

if (grid) {
  renderSkeletons();

  getProducts()
    .then(p => {
      all = p;
      render(all);
    })
    .catch(() => {});
}

/* ================== LOAD CATEGORIES ================== */

if (categoryBar) {
  getCategories().then(c => {

    categoryBar.innerHTML = "";

    addCategoryBtn("All", () => render(all), true);

    c.forEach(x => {
      addCategoryBtn(x, () => render(all.filter(p => p.category === x)));
    });

  });
}

/* ================== CATEGORY BUTTONS ================== */

function addCategoryBtn(name, handler, active = false) {
  if (!categoryBar) return;

  const btn = document.createElement("button");
  btn.textContent = name;
  btn.className = "cat-pill";

  if (active) btn.classList.add("active-cat-pill");

  btn.onclick = () => {
    setActive(btn);
    handler();
  };

  categoryBar.appendChild(btn);
}

function setActive(activeBtn) {
  if (!categoryBar) return;

  [...categoryBar.children].forEach(b => {
    b.classList.remove("active-cat-pill");
  });

  activeBtn.classList.add("active-cat-pill");
}

/* ================== STAR RENDER ================== */

function stars(rate) {
  const f = Math.round(rate || 0);
  return "★".repeat(f) + "☆".repeat(5 - f);
}

/* ================== RENDER HOME PRODUCTS ================== */

function render(list) {
  if (!grid) return;

  grid.innerHTML = "";

  list.forEach(p => {

    const d = document.createElement("div");
    d.className = "card";

    d.innerHTML = `
      <img src="${resolveImage(p.image, p.id)}"
           onerror="this.src='https://picsum.photos/seed/fallback${p.id}/600/600'">

      <h4>${p.title.slice(0,45)}</h4>
      <small>${p.category}</small>
      <div>${stars(p.rating?.rate)} (${p.rating?.count || 0})</div>
      <div class="price">₹${p.price}</div>

      <div class="actions">
        <span class="icon wish"></span>
        <button class="add-btn"></button>
      </div>
    `;

    /* ---------- CARD CLICK ---------- */

    d.onclick = (e) => {
      if (
        e.target.classList.contains("add-btn") ||
        e.target.classList.contains("wish")
      ) return;

      location.href = "product.html?id=" + p.id;
    };

    /* ---------- WISHLIST ---------- */

    const wishBtn = d.querySelector(".wish");
    updateWishIcon(wishBtn, p.id);

    wishBtn.onclick = (e) => {
      e.stopPropagation();
      toggleWish(p);
      updateWishIcon(wishBtn, p.id);
    };

    /* ---------- CART ---------- */

    const cartBtn = d.querySelector(".add-btn");
    updateCartButton(cartBtn, p);

    cartBtn.onclick = (e) => {
      e.stopPropagation();

      if (isInCart(p.id)) {
        removeFromCart(p.id);
      } else {
        addToCart(p);
      }

      updateCartButton(cartBtn, p);
      if (typeof updateBadges === "function") updateBadges();
    };

    grid.appendChild(d);
  });
}

/* ================== SEARCH ================== */

if (search && sug) {
  search.oninput = () => {

    sug.innerHTML = "";

    const q = search.value.toLowerCase();
    if (!q) return;

    all
      .filter(p => p.title.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach(p => {

        const d = document.createElement("div");
        d.textContent = p.title;

        d.onclick = () => {
          location.href = "product.html?id=" + p.id;
        };

        sug.appendChild(d);
      });
  };
}

/* ================== WISHLIST HELPERS ================== */

function isInWishlist(id) {
  const w = JSON.parse(localStorage.getItem("wishlist") || "[]");
  return w.some(x => String(x.id) === String(id));
}

function toggleWish(p) {
  let w = JSON.parse(localStorage.getItem("wishlist") || "[]");

  if (isInWishlist(p.id)) {
    w = w.filter(x => String(x.id) !== String(p.id));
  } else {
    w.push(p);
  }

  localStorage.setItem("wishlist", JSON.stringify(w));
  updateBadges();
}

/* ================== CART HELPERS ================== */

function isInCart(id) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  return cart.some(i => String(i.product?.id || i.id) === String(id));
}

function updateCartButton(btn, p) {
  if (!btn) return;

  if (isInCart(p.id)) {
    btn.textContent = "Remove";
    btn.classList.add("remove-btn");
  } else {
    btn.textContent = "Add";
    btn.classList.remove("remove-btn");
  }
}

function removeFromCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart = cart.filter(i => String(i.product?.id || i.id) !== String(id));
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* ================== LOGOUT (PLACEHOLDER) ================== */

function logout() {
  console.warn("Login not implemented yet");
}