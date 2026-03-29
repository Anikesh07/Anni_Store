/* =========================================
   CHATBOT INTENTS MODULE
========================================= */

window.chatbotState = window.chatbotState || {
  selectedIntent: null,
  intents: []
};

window.loadChatbotIntents = async function () {

  const container = document.getElementById("chatbot-tab-content");

  if (!container) {
    console.error("❌ chatbot-tab-content not found");
    return;
  }

  container.innerHTML = `
    <div class="dashboard-card chatbot-intents">

      <div class="chatbot-intents__header">
        <h2>🧠 Intent Manager</h2>
        <button class="btn-primary" id="add-intent-btn">+ Add Intent</button>
      </div>

      <div class="chatbot-intents__body">

        <div class="chatbot-intents__list" id="intent-list">
          ⏳ Loading intents...
        </div>

        <div class="chatbot-intents__details" id="intent-details">
          <p>Select an intent to view details</p>
        </div>

      </div>

    </div>
  `;

  bindIntentEvents();
  loadIntents();
};

/* =========================================
   LOAD INTENTS
========================================= */

async function loadIntents() {

  const list = document.getElementById("intent-list");

  list.innerHTML = `<p>⏳ Loading intents...</p>`;

  try {

    const res = await window.api.get("/intents");
    const intents = Array.isArray(res) ? res : res?.data || [];

    window.chatbotState.intents = intents;

    if (!intents.length) {
      list.innerHTML = `<p>No intents found</p>`;
      return;
    }

    list.innerHTML = intents.map(intent => `
      <div 
        class="chatbot-intents__item" 
        data-id="${intent._id}">
        ${intent.name}
      </div>
    `).join("");

    bindIntentClick();

    // ✅ Auto select first intent
    const first = intents[0];
    if (first) {
      window.chatbotState.selectedIntent = first;
      showIntentDetails(first);

      const firstEl = document.querySelector(".chatbot-intents__item");
      if (firstEl) firstEl.classList.add("active");
    }

  } catch (err) {

    list.innerHTML = `<p>❌ Failed to load intents</p>`;
    showNotification("❌ Failed to load intents", "error");
    console.error(err);
  }
}

/* =========================================
   CLICK HANDLER
========================================= */

function bindIntentClick() {

  document.querySelectorAll(".chatbot-intents__item").forEach(item => {

    item.onclick = () => {

      const id = item.dataset.id;

      document.querySelectorAll(".chatbot-intents__item")
        .forEach(i => i.classList.remove("active"));

      item.classList.add("active");

      const intent = window.chatbotState.intents.find(i => i._id === id);

      if (!intent) return;

      window.chatbotState.selectedIntent = intent;

      showIntentDetails(intent);

    };

  });
}

/* =========================================
   SHOW DETAILS
========================================= */

function showIntentDetails(intent) {

  const container = document.getElementById("intent-details");

  container.innerHTML = `
    <div class="chatbot-intents__detail-card">

      <h3>${intent.name}</h3>

      <div class="chatbot-intents__detail-actions">
        <button class="btn-primary" id="go-training">
          Go to Training
        </button>

        <button class="btn-secondary" id="delete-intent">
          Delete
        </button>
      </div>

    </div>
  `;

  /* GO TO TRAINING */
  document.getElementById("go-training").onclick = () => {
    chatbotGoTo("training");
  };

  /* DELETE INTENT */
  document.getElementById("delete-intent").onclick = async () => {

    if (!confirm("Delete this intent?")) return;

    try {

      await window.api.delete(`/intents/${intent._id}`);

      showNotification("🗑️ Intent deleted", "success");

      window.chatbotState.selectedIntent = null;

      loadIntents();

      container.innerHTML = `<p>Select an intent to view details</p>`;

    } catch (err) {

      showNotification("❌ Delete failed", "error");
    }
  };
}

/* =========================================
   ADD INTENT
========================================= */

function bindIntentEvents() {

  document.getElementById("add-intent-btn").onclick = async () => {

    const name = prompt("Enter intent name");

    if (!name) return;

    const cleanName = name.trim().toLowerCase();

    // ✅ validation (matches backend)
    if (!/^[a-z0-9_]+$/.test(cleanName)) {
      showNotification("⚠️ Use lowercase, no spaces, only letters/numbers/_", "info");
      return;
    }

    try {

      await window.api.post("/intents", { name: cleanName });

      showNotification("✅ Intent created", "success");

      loadIntents();

    } catch (err) {

      showNotification("❌ Failed to create intent", "error");
    }
  };
}