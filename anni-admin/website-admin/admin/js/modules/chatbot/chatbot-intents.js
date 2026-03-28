/* =========================================
   CHATBOT INTENTS MODULE
   - List intents
   - Create intent
   - Select intent
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

      <!-- HEADER -->
      <div class="chatbot-intents__header">
        <h2>🧠 Intent Manager</h2>
        <button class="btn-primary" id="add-intent-btn">+ Add Intent</button>
      </div>

      <!-- BODY -->
      <div class="chatbot-intents__body">

        <!-- LEFT: INTENT LIST -->
        <div class="chatbot-intents__list" id="intent-list">
          Loading intents...
        </div>

        <!-- RIGHT: DETAILS -->
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
   LOAD INTENTS FROM API
========================================= */

async function loadIntents() {

  const list = document.getElementById("intent-list");

  try {

    const intents = await window.api.get("/intents");

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

  } catch (err) {

    list.innerHTML = `<p>❌ Failed to load intents</p>`;
    console.error(err);
  }
}



/* =========================================
   CLICK HANDLER FOR INTENTS
========================================= */

function bindIntentClick() {

  document.querySelectorAll(".chatbot-intents__item").forEach(item => {

    item.onclick = () => {

      const id = item.dataset.id;

      // Set selected
      document.querySelectorAll(".chatbot-intents__item")
        .forEach(i => i.classList.remove("active"));

      item.classList.add("active");

      const intent = window.chatbotState.intents.find(i => i._id === id);

      window.chatbotState.selectedIntent = intent;

      showIntentDetails(intent);

    };

  });
}



/* =========================================
   SHOW INTENT DETAILS
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

  // Navigate to training
  document.getElementById("go-training").onclick = () => {
    chatbotGoTo("training");
  };

  // Delete intent
  document.getElementById("delete-intent").onclick = async () => {

    if (!confirm("Delete this intent?")) return;

    try {
      await window.api.delete(`/intents/${intent._id}`);
      loadIntents();
      container.innerHTML = `<p>Intent deleted</p>`;
    } catch (err) {
      alert("❌ Delete failed");
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

    try {

      await window.api.post("/intents", { name });

      loadIntents();

    } catch (err) {

      alert("❌ Failed to create intent");
    }
  };
}