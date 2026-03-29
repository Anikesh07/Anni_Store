/* =========================================
   CHATBOT RESPONSES MODULE
========================================= */

window.loadChatbotResponses = async function () {

  const container = document.getElementById("chatbot-tab-content");
  if (!container) return;

  const intent = window.chatbotState?.selectedIntent;

  /* ❌ NO INTENT SELECTED */
  if (!intent) {
    container.innerHTML = `
      <div class="dashboard-card chatbot-responses">

        <h2>💬 Responses</h2>

        <div class="chatbot-responses__empty">
          <p>No intent selected</p>
          <button class="btn-primary" id="go-intents">
            Go to Intents
          </button>
        </div>

      </div>
    `;

    document.getElementById("go-intents").onclick = () => {
      chatbotGoTo("intents");
    };

    return;
  }

  /* ✅ UI */
  container.innerHTML = `
    <div class="dashboard-card chatbot-responses">

      <div class="chatbot-responses__header">
        <h2>💬 Responses</h2>
        <p>Intent: <strong>${intent.name}</strong></p>
      </div>

      <div class="chatbot-responses__add">

        <input 
          id="response-input" 
          placeholder="Enter bot response..."
        />

        <button class="btn-primary" id="add-response-btn">
          Add
        </button>

      </div>

      <div class="chatbot-responses__list" id="response-list">
        ⏳ Loading...
      </div>

    </div>
  `;

  bindResponseEvents(intent);
  loadResponses(intent._id);
};

/* =========================================
   LOAD RESPONSES
========================================= */

async function loadResponses(intentId) {

  const list = document.getElementById("response-list");

  list.innerHTML = `<p>⏳ Loading...</p>`;

  try {

    const res = await window.api.get(`/responses/${intentId}`);
    const responses = Array.isArray(res) ? res : res?.data || [];

    if (!responses.length) {
      list.innerHTML = `<p>No responses yet</p>`;
      return;
    }

    list.innerHTML = responses.map(r => {

      const msgs = r.messages || [];
      const display = msgs.join(", ");

      return `
        <div class="chatbot-responses__item">

          <span>${escapeHTML(display)}</span>

          <button class="delete-btn" data-id="${r._id}">
            ✖
          </button>

        </div>
      `;
    }).join("");

    bindDeleteResponse(intentId);

  } catch (err) {

    console.error(err);
    showNotification("❌ Failed to load responses", "error");

    list.innerHTML = `<p>❌ Failed to load responses</p>`;
  }
}

/* =========================================
   ADD RESPONSE
========================================= */

function bindResponseEvents(intent) {

  document.getElementById("add-response-btn").onclick = async () => {

    const input = document.getElementById("response-input");
    const text = input.value.trim();

    if (!text) {
      showNotification("⚠️ Response cannot be empty", "info");
      return;
    }

    try {

      await window.api.post("/responses", {
        intentId: intent._id,
        messages: [text] // 🔥 FIXED (was text)
      });

      input.value = "";

      showNotification("✅ Response added", "success");

      loadResponses(intent._id);

    } catch (err) {

      showNotification("❌ Failed to add response", "error");
    }
  };
}

/* =========================================
   DELETE RESPONSE
========================================= */

function bindDeleteResponse(intentId) {

  document.querySelectorAll(".delete-btn").forEach(btn => {

    btn.onclick = async () => {

      const id = btn.dataset.id;

      if (!confirm("Delete this response?")) return;

      try {

        await window.api.delete(`/responses/${id}`);

        showNotification("🗑️ Response deleted", "success");

        loadResponses(intentId);

      } catch (err) {

        showNotification("❌ Delete failed", "error");
      }
    };
  });
}

/* =========================================
   HELPERS
========================================= */

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}