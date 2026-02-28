// ❌ AUTH CHECK REMOVED (login skipped for now)

// ELEMENTS
const list = document.getElementById("cartList");
const totalEl = document.getElementById("total");
const itemCountEl = document.getElementById("itemCount");
const checkoutBtn = document.getElementById("checkoutBtn");

// SAFETY CHECK: run only on cart page
if (!list || !totalEl || !itemCountEl) {
  console.warn("Cart elements not found. cart.js stopped.");
} else {

  function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  }

  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function renderCart() {
    const cart = getCart();

    list.innerHTML = "";
    let total = 0;
    let totalItems = 0;

    if (cart.length === 0) {
      list.innerHTML = "<p>Your cart is empty.</p>";
      totalEl.textContent = "₹0";
      itemCountEl.textContent = "0";
      if (typeof updateBadges === "function") updateBadges();
      return;
    }

    cart.forEach((item, index) => {
      const p = item.product;
      const sub = p.price * item.qty;

      total += sub;
      totalItems += item.qty;

      const row = document.createElement("div");
      row.className = "cart-item-row";

      row.innerHTML = `
        <img src="${p.image}"
             onerror="this.src='https://picsum.photos/seed/fallback${p.id}/600/600'">

        <div class="cart-info">
          <div class="cart-title">${p.title}</div>
          <div class="cart-price">₹${p.price}</div>
        </div>

        <div class="cart-qty">
          <button class="minus">-</button>
          <span>${item.qty}</span>
          <button class="plus">+</button>
        </div>

        <div class="cart-sub">
          ₹${sub.toFixed(2)}
        </div>

        <button class="remove">✖</button>
      `;

      row.querySelector(".minus").onclick = () => changeQty(index, -1);
      row.querySelector(".plus").onclick  = () => changeQty(index, 1);
      row.querySelector(".remove").onclick = () => removeItem(index);

      list.appendChild(row);
    });

    totalEl.textContent = "₹" + total.toFixed(2);
    itemCountEl.textContent = totalItems;

    if (typeof updateBadges === "function") {
      updateBadges();
    }
  }

  function changeQty(index, delta) {
    const cart = getCart();
    if (!cart[index]) return;

    cart[index].qty += delta;

    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }

    saveCart(cart);
    renderCart();
  }

  function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
  }

  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
      window.location.href = "checkout.html";
    };
  }

  renderCart();
}
