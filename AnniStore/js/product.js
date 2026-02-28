/* ================= PRODUCT PAGE ================= */

(function () {

  const SERVER_BASE = "http://localhost:4000";

  const page = document.querySelector(".product-page");
  if (!page) return;

  const imgEl        = document.getElementById("productImage");
  const titleEl      = document.getElementById("productTitle");
  const priceEl      = document.getElementById("productPrice");
  const ratingEl     = document.getElementById("productRating");
  const descEl       = document.getElementById("productDescription");
  const highlightsEl = document.getElementById("productHighlights");
  const relatedEl    = document.getElementById("relatedProducts");

  const addBtn  = document.getElementById("addToCartBtn");
  const buyBtn  = document.getElementById("buyNowBtn");
  const wishBtn = document.getElementById("wishlistBtn");

  addBtn.disabled = true;
  buyBtn.disabled = true;

  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    titleEl.textContent = "Product not found";
    return;
  }

  /* ================= IMAGE RESOLVER ================= */

  function resolveImage(image, id) {
    if (!image) {
      return `https://picsum.photos/seed/${id}/600/600`;
    }

    // If already full URL (FakeStore etc.)
    if (image.startsWith("http")) {
      return image;
    }

    // Otherwise attach backend base URL
    return `${SERVER_BASE}${image}`;
  }

  /* ================= LOAD PRODUCT ================= */

  getProduct(id).then(p => {

    if (!p) {
      titleEl.textContent = "Product not found";
      descEl.textContent = "This product does not exist.";
      addBtn.style.display = "none";
      buyBtn.style.display = "none";
      wishBtn.style.display = "none";
      return;
    }

    /* ---------- RENDER ---------- */

    imgEl.src = resolveImage(p.image, p.id);
    imgEl.onerror = () => {
      imgEl.src = `https://picsum.photos/seed/${p.id}/600/600`;
    };

    titleEl.textContent = p.title;
    priceEl.textContent = `₹${p.price}`;

    const rate = Math.round(p.rating?.rate || 0);
    const count = p.rating?.count || 0;

    ratingEl.textContent =
      rate > 0
        ? "⭐".repeat(rate) + "☆".repeat(5 - rate) + ` (${count} ratings)`
        : "No ratings yet";

    descEl.textContent = p.description;

    highlightsEl.innerHTML = `
      <strong>Highlights</strong>
      <ul>
        <li>Category: ${p.category}</li>
        <li>Rating: ${rate || "N/A"} / 5</li>
        <li>Stock: ${p.stock > 0 ? "Available" : "Out of stock"}</li>
      </ul>
    `;

    /* ---------- STOCK LOGIC ---------- */

    if (p.stock <= 0) {
      addBtn.disabled = true;
      buyBtn.disabled = true;
      addBtn.textContent = "Out of Stock";
      buyBtn.textContent = "Unavailable";
      return;
    }

    addBtn.disabled = false;
    buyBtn.disabled = false;

    if (isInCart(p.id)) {
      addBtn.textContent = "Added to Cart";
      addBtn.classList.add("added-btn");
      addBtn.disabled = true;
    }

    addBtn.onclick = () => {
      addToCart(p);
      addBtn.textContent = "Added to Cart";
      addBtn.classList.add("added-btn");
      addBtn.disabled = true;
      updateBadges();
    };

    buyBtn.onclick = () => {
      if (!isInCart(p.id)) addToCart(p);
      updateBadges();
      window.location.href = "cart.html";
    };

    function syncWishlist() {
      if (isInWishlist(p.id)) {
        wishBtn.textContent = "❤️ Wishlisted";
        wishBtn.classList.add("active");
      } else {
        wishBtn.textContent = "🤍 Wishlist";
        wishBtn.classList.remove("active");
      }
    }

    syncWishlist();

    wishBtn.onclick = () => {
      toggleWish(p);
      syncWishlist();
      updateBadges();
    };

    renderRelated(p);
  });

  /* ================= RELATED PRODUCTS ================= */

  function renderRelated(current) {
    getProducts().then(all => {
      relatedEl.innerHTML = "";

      all
        .filter(p => p.category === current.category && p.id !== current.id)
        .slice(0, 6)
        .forEach(p => {

          const card = document.createElement("div");
          card.className = "card";

          card.innerHTML = `
            <img src="${resolveImage(p.image, p.id)}"
                 onerror="this.src='https://picsum.photos/seed/${p.id}/600/600'">
            <h4>${p.title.slice(0, 40)}</h4>
            <div class="price">₹${p.price}</div>
          `;

          card.onclick = () => {
            window.location.href = `product.html?id=${p.id}`;
          };

          relatedEl.appendChild(card);
        });
    });
  }

})();