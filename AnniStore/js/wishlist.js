// =========================
// WISHLIST STORE (FIXED)
// =========================
const WishlistStore = {
  key: "wishlist",

  get() {
    return JSON.parse(localStorage.getItem(this.key) || "[]");
  },

  set(items) {
    localStorage.setItem(this.key, JSON.stringify(items));
  },

  remove(index) {
    const list = this.get();
    list.splice(index, 1);
    this.set(list);
  },

  count() {
    return this.get().length;
  }
};

// =========================
// UI LOGIC
// =========================
const list = document.getElementById("wishList");

if (!list) {
  console.warn("Wishlist element not found. wishlist.js stopped.");
} else {

  function renderWishlist() {
    const w = WishlistStore.get();
    list.innerHTML = "";

    if (w.length === 0) {
      list.innerHTML = "<p>Your wishlist is empty.</p>";
      updateBadges();
      return;
    }

    w.forEach((p, i) => {
      const d = document.createElement("div");
      d.className = "card";

      d.innerHTML = `
        <img src="${p.image}"
             onerror="this.src='https://picsum.photos/seed/fallback${p.id}/600/600'">
        <h4>${p.title.slice(0, 45)}</h4>
        <div class="price">₹${p.price}</div>
        <button class="add-btn remove-btn">Remove</button>
      `;

      d.querySelector("button").onclick = () => {
        WishlistStore.remove(i);
        renderWishlist();
        updateBadges();
      };

      list.appendChild(d);
    });
  }

  renderWishlist();
}
