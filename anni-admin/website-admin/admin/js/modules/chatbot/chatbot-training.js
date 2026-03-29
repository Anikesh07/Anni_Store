/* =========================================
   CHATBOT TRAINING MODULE
========================================= */

window.loadChatbotTraining = async function () {

  const container = document.getElementById("chatbot-tab-content");

  if (!container) {
    console.error("❌ chatbot-tab-content not found");
    return;
  }

  const intent = window.chatbotState?.selectedIntent;

  /* ❌ NO INTENT SELECTED */
  if (!intent) {
    container.innerHTML = `
      <div class="dashboard-card chatbot-training">

        <h2>📚 Training</h2>

        <div class="chatbot-training__empty">
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

  /* ✅ MAIN UI */
  container.innerHTML = `
    <div class="dashboard-card chatbot-training">

      <div class="chatbot-training__header">
        <div>
          <h2>📚 Training</h2>
          <p>Intent: <strong>${intent.name}</strong></p>
        </div>
      </div>

      <div class="chatbot-training__add">

        <input 
          id="training-input" 
          placeholder="Enter training phrase..."
        />

        <button class="btn-primary" id="add-training-btn">
          Add
        </button>

      </div>

      <div class="chatbot-training__list" id="training-list">
        ⏳ Loading...
      </div>

    </div>
  `;

  bindTrainingEvents(intent);
  loadTrainingData(intent._id);
};

/* =========================================
   LOAD TRAINING DATA
========================================= */

async function loadTrainingData(intentId) {

  const list = document.getElementById("training-list");

  list.innerHTML = `<p>⏳ Loading...</p>`;

  try {

    const res = await window.api.get(`/training/${intentId}`);
    const phrases = Array.isArray(res) ? res : res?.data || [];

    if (!phrases.length) {
      list.innerHTML = `<p>No training phrases yet</p>`;
      return;
    }

    list.innerHTML = phrases.map(p => `
      <div class="chatbot-training__item">

        <span>${escapeHTML(p.text || "")}</span>

        <button 
          class="delete-btn" 
          data-id="${p._id}">
          ✖
        </button>

      </div>
    `).join("");

    bindDeleteTraining(intentId);

  } catch (err) {

    console.error(err);
    showNotification("❌ Failed to load training data", "error");

    list.innerHTML = `<p>❌ Failed to load training data</p>`;
  }
}

/* =========================================
   ADD TRAINING PHRASE
========================================= */

function bindTrainingEvents(intent) {

  document.getElementById("add-training-btn").onclick = async () => {

    const input = document.getElementById("training-input");
    const text = input.value.trim();

    if (!text) {
      showNotification("⚠️ Phrase cannot be empty", "info");
      return;
    }

    try {

      await window.api.post("/training", {
        intentId: intent._id,
        text
      });

      input.value = "";

      showNotification("✅ Training phrase added", "success");

      loadTrainingData(intent._id);

    } catch (err) {

      showNotification("❌ Failed to add training phrase", "error");
    }
  };
}

/* =========================================
   DELETE TRAINING PHRASE
========================================= */

function bindDeleteTraining(intentId) {

  document.querySelectorAll(".delete-btn").forEach(btn => {

    btn.onclick = async () => {

      const id = btn.dataset.id;

      if (!confirm("Delete this phrase?")) return;

      try {

        await window.api.delete(`/training/${id}`);

        showNotification("🗑️ Training phrase deleted", "success");

        loadTrainingData(intentId);

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