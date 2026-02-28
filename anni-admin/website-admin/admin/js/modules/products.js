/* =========================================================
   PRODUCTS MODULE – FINAL COMPLETE STABLE VERSION
========================================================= */

let products = [];
let productsLoaded = false;
let editingId = null;
let deleteTargetId = null;
let bulkMode = false;

let currentPage = 1;
const itemsPerPage = 50;

const API_BASE = "http://localhost:4000/products";
const SERVER_BASE = "http://localhost:4000";

/* =========================================================
   LOAD MODULE
========================================================= */
async function loadProductsModule() {

  const container = document.getElementById("products");

  // If HTML not yet built OR not loaded before → rebuild
  if (!productsLoaded) {

    container.innerHTML = `
      <h1 class="section-title">Products</h1>

      <div class="products-toolbar">
        <div class="toolbar-left">
          <input type="text"
                 id="searchInput"
                 placeholder="Search product..."
                 class="search-input">
        </div>

        <div class="toolbar-right">
          <select id="categoryFilter" class="category-select"></select>

          <div class="manage-group">
            <button class="btn-small danger animate-btn"
                    id="bulkBtn">Manage</button>
            <button class="btn-small danger hidden animate-btn"
                    id="bulkDeleteBtn">🗑 Delete</button>
          </div>

          <button class="btn-primary"
                  id="openProductModal">
            + Add Product
          </button>
        </div>
      </div>

      <div class="card product-card">

        <div id="loadingState" class="loading-state">
          <div class="skeleton-table">
            ${generateSkeletonRows(8)}
          </div>
        </div>

        <table class="product-table"
               id="productTable"
               style="display:none;">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th class="bulk-column hidden">
                <input type="checkbox" id="selectAll">
              </th>
              <th>Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="productTableBody"></tbody>
        </table>

      </div>

      ${getProductModalHTML()}
      ${getConfirmModalHTML()}
      <div id="toastContainer" class="toast-container"></div>
    `;

    initializeProductModule();
    await loadProductsFromServer();

    productsLoaded = true;
    return;
  }

  // If already loaded before → just render instantly
  renderTable();
}

function generateSkeletonRows(count) {
  let rows = "";

  for (let i = 0; i < count; i++) {
    rows += `
      <div class="skeleton-row"></div>
    `;
  }

  return rows;
}



/* =========================================================
   PRODUCT MODAL HTML
========================================================= */
function getProductModalHTML() {
  return `
  <div class="modal-overlay" id="productModal">
    <div class="modal product-modal">

      <div class="modal-header">
        <h2 id="modalTitle">Add Product</h2>
        <span id="closeProductModal" class="modal-close">&times;</span>
      </div>

      <form id="productForm" class="product-form">

        <div class="form-group full">
          <label>Product Image</label>
          <input type="file" id="productImage">
          <img id="imagePreview" class="image-preview hidden"/>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Title</label>
            <input type="text" id="productTitle" required>
          </div>

          <div class="form-group">
            <label>Category</label>
            <select id="productCategorySelect"></select>
          </div>

          <div class="form-group full">
            <label>Description</label>
            <textarea id="productDescription"></textarea>
          </div>

          <div class="form-group">
            <label>Price</label>
            <input type="number" id="productPrice" required>
          </div>

          <div class="form-group">
            <label>Stock</label>
            <input type="number" id="productStock">
          </div>
        </div>

        <div class="confirm-actions">
          <button type="button" id="cancelProduct" class="btn-light">Cancel</button>
          <button type="submit" class="btn-primary">Save Product</button>
        </div>

      </form>
    </div>
  </div>
  `;
}

/* =========================================================
   CONFIRM MODAL HTML
========================================================= */
function getConfirmModalHTML() {
  return `
  <div class="modal-overlay" id="confirmModal">
    <div class="modal confirm-modal">
      <h3>Delete Product?</h3>
      <div class="confirm-actions">
        <button id="cancelDelete">Cancel</button>
        <button id="confirmDeleteBtn" class="btn-small danger">Delete</button>
      </div>
    </div>
  </div>
  `;
}

/* =========================================================
   INITIALIZE EVENTS
========================================================= */
function initializeProductModule() {

  const modal = document.getElementById("productModal");
  const confirmModal = document.getElementById("confirmModal");
  const form = document.getElementById("productForm");

  const bulkBtn = document.getElementById("bulkBtn");
  const bulkDeleteBtn = document.getElementById("bulkDeleteBtn");
  const selectAll = document.getElementById("selectAll");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  /* ===============================
     MANAGE BUTTON
  =============================== */
  if (bulkBtn) {
    bulkBtn.onclick = function () {

      if (!bulkMode) {
        bulkMode = true;
        bulkBtn.textContent = "Cancel";
        renderTable();
        updateBulkUI();
        return;
      }

      // Cancel manage mode
      exitBulkMode();
    };
  }

  /* ===============================
     BULK DELETE BUTTON
  =============================== */
  if (bulkDeleteBtn) {
    bulkDeleteBtn.onclick = function () {

      const selected = getSelectedIds();
      if (selected.length === 0) return;

      if (confirmModal) {
        confirmModal.classList.add("active");
      }
    };
  }

  /* ===============================
     SELECT ALL (DEFENSIVE SAFE)
  =============================== */
  if (selectAll) {
    selectAll.onchange = function () {

      const checked = this.checked;

      document.querySelectorAll(".product-checkbox")
        .forEach(cb => {
          cb.checked = checked;

          const row = cb.closest("tr");
          if (row) {
            if (checked)
              row.classList.add("row-selected");
            else
              row.classList.remove("row-selected");
          }
        });

      updateBulkUI();
    };
  }

if (searchInput) {
  searchInput.oninput = () => {
    currentPage = 1;
    renderTable();
  };
}

if (categoryFilter) {
  categoryFilter.onchange = () => {
    currentPage = 1;
    renderTable();
  };
}

  /* ===============================
     ADD PRODUCT MODAL
  =============================== */
  const openBtn = document.getElementById("openProductModal");

  if (openBtn && modal && form) {
    openBtn.onclick = () => {
      editingId = null;
      form.reset();

      const preview = document.getElementById("imagePreview");
      if (preview) preview.classList.add("hidden");

      document.getElementById("modalTitle").textContent = "Add Product";
      modal.classList.add("active");
    };
  }

  /* ===============================
     CLOSE PRODUCT MODAL
  =============================== */
  const closeModalBtn = document.getElementById("closeProductModal");
  const cancelProductBtn = document.getElementById("cancelProduct");

  if (closeModalBtn && modal)
    closeModalBtn.onclick = () => modal.classList.remove("active");

  if (cancelProductBtn && modal)
    cancelProductBtn.onclick = () => modal.classList.remove("active");

  /* ===============================
     CONFIRM DELETE MODAL
  =============================== */
  const cancelDeleteBtn = document.getElementById("cancelDelete");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  if (cancelDeleteBtn && confirmModal)
    cancelDeleteBtn.onclick = () => confirmModal.classList.remove("active");

  if (confirmDeleteBtn)
    confirmDeleteBtn.onclick = handleSingleDelete;

  /* ===============================
     FORM SUBMIT
  =============================== */
  if (form)
    form.onsubmit = handleSubmit;
}



/* =========================================================
   LOAD PRODUCTS – PREMIUM VERSION
========================================================= */
async function loadProductsFromServer() {

  const loadingState = document.getElementById("loadingState");
  const table = document.getElementById("productTable");
  const tbody = document.getElementById("productTableBody");

  // Show skeleton immediately
  loadingState.innerHTML = `
    <div class="skeleton-table">
      ${generateSkeletonRows(8)}
    </div>
  `;

  loadingState.style.display = "block";
  table.style.display = "none";
  tbody.innerHTML = "";

  const startTime = Date.now();

  try {

    const res = await fetch(API_BASE);

    if (!res.ok) {
      throw new Error("Server not responding");
    }

    products = await res.json();

    populateCategoryFilter();
    renderTable();

    // Enforce minimum skeleton display time (400ms)
    const elapsed = Date.now() - startTime;
    const remaining = 400 - elapsed;

    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
    }

    loadingState.style.display = "none";
    table.style.display = "table";

  } catch (error) {

    console.error("Load Error:", error);

    loadingState.style.display = "none";
    table.style.display = "none";

    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:40px;">
          <div style="font-weight:600; margin-bottom:10px;">
            ⚠ Unable to connect to server
          </div>
          <div style="margin-bottom:15px; color:var(--text-soft);">
            Wait for server to be ready.
          </div>
          <button class="btn-primary"
                  onclick="loadProductsFromServer()">
            Retry
          </button>
        </td>
      </tr>
    `;

    table.style.display = "table";
  }
}
/* =========================================================
   RENDER TABLE
========================================================= */
function renderTable() {

  const tbody = document.getElementById("productTableBody");
  if (!tbody) return;

  /* ===============================
     SEARCH FILTER
  =============================== */
  const searchValue =
    document.getElementById("searchInput")?.value.toLowerCase() || "";

  /* ===============================
     CATEGORY FILTER
  =============================== */
  const selectedCategory =
    document.getElementById("categoryFilter")?.value || "all";

  /* ===============================
     APPLY FILTERS
  =============================== */
  let filteredProducts = products;

  if (searchValue) {
    filteredProducts = filteredProducts.filter(p =>
      p.title?.toLowerCase().includes(searchValue)
    );
  }

  if (selectedCategory !== "all") {
    filteredProducts = filteredProducts.filter(p =>
      p.category === selectedCategory
    );
  }

  /* ===============================
     PAGINATION
  =============================== */
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (currentPage > Math.ceil(filteredProducts.length / itemsPerPage)) {
  currentPage = 1;
}

  if (currentPage > totalPages) currentPage = 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedProducts =
    filteredProducts.slice(startIndex, endIndex);

  /* ===============================
     EMPTY STATE
  =============================== */
  if (paginatedProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:40px;color:var(--text-soft)">
          No products found
        </td>
      </tr>
    `;
    renderPagination(totalPages);
    return;
  }

  /* ===============================
     RENDER ROWS
  =============================== */
  tbody.innerHTML = paginatedProducts.map((p, index) => {

    const serialNumber = startIndex + index + 1;

    let status = "";
    if (p.stock === 0)
      status = `<span class="badge inactive">Out of Stock</span>`;
    else if (p.stock < 50)
      status = `<span class="badge warning">Low Stock</span>`;
    else
      status = `<span class="badge success">In Stock</span>`;

    return `
      <tr>
        <td>${serialNumber}</td>

        <td class="bulk-column ${bulkMode ? "" : "hidden"}">
          <input type="checkbox"
                 class="product-checkbox"
                 value="${p._id}">
        </td>
        
        <td><img src="${resolveImage(p.image)}" class="table-img"></td>
        <td>${p.title}</td>
        <td>$${p.price}</td>
        <td>${p.stock}</td>
        <td>${status}</td>

        <td>
          ${
            bulkMode
              ? `<button class="btn-small disabled">Edit</button>
                 <button class="btn-small danger disabled">Delete</button>`
              : `<button onclick="editProduct('${p._id}')" class="btn-small">Edit</button>
                 <button onclick="deleteProduct('${p._id}')" class="btn-small danger">Delete</button>`
          }
        </td>
      </tr>
    `;
  }).join("");

  /* ===============================
     SHOW / HIDE CHECKBOX COLUMN
  =============================== */
  document.querySelectorAll(".bulk-column")
    .forEach(col => {
      if (bulkMode) col.classList.remove("hidden");
      else col.classList.add("hidden");
    });

  /* ===============================
     CHECKBOX LISTENER
  =============================== */
  document.querySelectorAll(".product-checkbox")
    .forEach(cb => {
      cb.addEventListener("change", function () {

        const row = this.closest("tr");
        if (!row) return;

        if (this.checked)
          row.classList.add("row-selected");
        else
          row.classList.remove("row-selected");

        updateBulkUI();
      });
    });

  renderPagination(totalPages);
}

/* =========================================================
   PAGINATION
========================================================= */
function renderPagination(totalPages) {

  let container = document.getElementById("pagination");

  if (!container) {
    container = document.createElement("div");
    container.id = "pagination";
    container.style.marginTop = "20px";
    container.style.textAlign = "center";
    document.querySelector(".product-card").appendChild(container);
  }

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = "";

  /* ===============================
     PREVIOUS BUTTON
  =============================== */
  html += `
    <button class="btn-small"
      ${currentPage === 1 ? "disabled" : ""}
      onclick="changePage(${currentPage - 1})">
      ◀
    </button>
  `;

  /* ===============================
     SHOW MAX 5 PAGE NUMBERS
  =============================== */

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `
      <button 
        class="btn-small ${i === currentPage ? "danger" : ""}"
        onclick="changePage(${i})"
        style="margin: 0 4px;">
        ${i}
      </button>
    `;
  }

  /* ===============================
     NEXT BUTTON
  =============================== */
  html += `
    <button class="btn-small"
      ${currentPage === totalPages ? "disabled" : ""}
      onclick="changePage(${currentPage + 1})">
      ▶
    </button>
  `;

  container.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  renderTable();
}



/* =========================================================
   MANAGE MODE (Previously Bulk Mode)
========================================================= */


function exitBulkMode() {
  bulkMode = false;

  document.getElementById("bulkBtn").textContent = "Manage";
  document.getElementById("bulkDeleteBtn").classList.add("hidden");

  renderTable();
}

function getSelectedIds() {
  return Array.from(
    document.querySelectorAll(".product-checkbox:checked")
  ).map(cb => cb.value);
}

function updateBulkUI() {

  if (!bulkMode) return;

  const selected = getSelectedIds();
  const deleteBtn = document.getElementById("bulkDeleteBtn");

  if (selected.length > 0) {
    deleteBtn.classList.remove("hidden");
    deleteBtn.textContent = `🗑 Delete (${selected.length})`;
  } else {
    deleteBtn.classList.add("hidden");
  }
}





/* =========================================================
   EDIT
========================================================= */
function editProduct(id) {

  const product = products.find(p => p._id === id);
  if (!product) return;

  editingId = id;

  document.getElementById("productTitle").value = product.title;
  document.getElementById("productDescription").value = product.description;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productStock").value = product.stock;
  document.getElementById("productCategorySelect").value = product.category;

  const preview = document.getElementById("imagePreview");
  preview.src = resolveImage(product.image);
  preview.classList.remove("hidden");

  document.getElementById("modalTitle").textContent = "Edit Product";
  document.getElementById("productModal").classList.add("active");
}

/* =========================================================
   SINGLE DELETE
========================================================= */
function deleteProduct(id) {
  deleteTargetId = id;
  document.getElementById("confirmModal").classList.add("active");
}
async function handleSingleDelete() {

  const selected = getSelectedIds();

  // MANAGE MODE DELETE
  if (bulkMode && selected.length > 0) {

    const rows = document.querySelectorAll(".product-checkbox:checked");

    // Animate rows before delete
    rows.forEach(cb => {
      const row = cb.closest("tr");
      row.classList.add("row-deleting");
    });

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 300));

    await Promise.all(
      selected.map(id =>
        fetch(`${API_BASE}/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          }
        })
      )
    );

    showToast("Selected items deleted");
    document.getElementById("confirmModal").classList.remove("active");
    exitBulkMode();
    loadProductsFromServer();
    return;
  }

  // SINGLE DELETE (with animation)
  if (!deleteTargetId) return;

  const row = document.querySelector(
    `.product-checkbox[value="${deleteTargetId}"]`
  )?.closest("tr");

  if (row) {
    row.classList.add("row-deleting");
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  await fetch(`${API_BASE}/${deleteTargetId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`
    }
  });

  document.getElementById("confirmModal").classList.remove("active");
  showToast("Product deleted");
  deleteTargetId = null;
  loadProductsFromServer();
}



/* =========================================================
   CATEGORY
========================================================= */
function populateCategoryFilter() {

  const filter = document.getElementById("categoryFilter");
  const categorySelect = document.getElementById("productCategorySelect");

  if (!products || products.length === 0) {

    // Show default option if no products
    filter.innerHTML = `<option value="all">All Categories</option>`;
    categorySelect.innerHTML = `<option value="">Select Category</option>`;
    return;
  }

  const categories =
    [...new Set(products.map(p => p.category || "uncategorized"))];

  filter.innerHTML =
    `<option value="all">All Categories</option>` +
    categories.map(c => `<option value="${c}">${c}</option>`).join("");

  categorySelect.innerHTML =
    categories.map(c => `<option value="${c}">${c}</option>`).join("");
}


/* =========================================================
   SUBMIT
========================================================= */
async function handleSubmit(e) {

  e.preventDefault();

  try {

    const titleInput = document.getElementById("productTitle");
    const descriptionInput = document.getElementById("productDescription");
    const categoryInput = document.getElementById("productCategorySelect");
    const priceInput = document.getElementById("productPrice");
    const stockInput = document.getElementById("productStock");
    const imageInput = document.getElementById("productImage");

    /* ===============================
       BASIC VALIDATION
    =============================== */
    if (!titleInput.value.trim()) {
      showToast("Title is required");
      return;
    }

    if (priceInput.value < 0) {
      showToast("Price cannot be negative");
      return;
    }

    if (stockInput.value < 0) {
      showToast("Stock cannot be negative");
      return;
    }

    /* ===============================
       BUILD FORM DATA
    =============================== */
    const formData = new FormData();

    const file = imageInput?.files?.[0];
    if (file) formData.append("image", file);

    formData.append("title", titleInput.value.trim());
    formData.append("description", descriptionInput.value.trim());
    formData.append("category", categoryInput.value);
    formData.append("price", priceInput.value);
    formData.append("stock", stockInput.value);

    /* ===============================
       SEND REQUEST
    =============================== */
    const response = await fetch(
      editingId ? `${API_BASE}/${editingId}` : API_BASE,
      {
        method: editingId ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error("Server error while saving product");
    }

    /* ===============================
       SUCCESS
    =============================== */
    document.getElementById("productModal")?.classList.remove("active");

    showToast(editingId ? "Product updated" : "Product added");

    editingId = null;

    loadProductsFromServer();

  } catch (error) {

    console.error("Submit Error:", error);
    showToast("Something went wrong");

  }
}

/* =========================================================
   HELPERS
========================================================= */
function resolveImage(image) {
  if (!image) return "https://picsum.photos/seed/fallback/100/100";
  return image.startsWith("http") ? image : `${SERVER_BASE}${image}`;
}

function showToast(message) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

window.loadProductsModule = loadProductsModule;

/* =========================================================
   SKELETON HELPER
========================================================= */
function generateSkeletonRows(count) {
  let rows = "";
  for (let i = 0; i < count; i++) {
    rows += `<div class="skeleton-row"></div>`;
  }
  return rows;
}