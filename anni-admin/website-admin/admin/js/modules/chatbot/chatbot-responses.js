/* =========================================
   CHATBOT RESPONSES MODULE
   - Manage bot replies per intent
========================================= */

window.loadChatbotResponses = async function () {

  const container = document.getElementById("chatbot-tab-content");

  if (!container) return;

  const intent = window.chatbotState?.selectedIntent;

  // ❌ No intent selected
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

  // ✅ UI
  container.innerHTML = `
    <div class="dashboard-card chatbot-responses">

      <!-- HEADER -->
      <div class="chatbot-responses__header">
        <h2>💬 Responses</h2>
        <p>Intent: <strong>${intent.name}</strong></p>
      </div>

      <!-- ADD RESPONSE -->
      <div class="chatbot-responses__add">

        <input 
          id="response-input" 
          placeholder="Enter bot response..."
        />

        <button class="btn-primary" id="add-response-btn">
          Add
        </button>

      </div>

      <!-- LIST -->
      <div class="chatbot-responses__list" id="response-list">
        Loading...
      </div>

    </div>
  `;

  bindResponseEvents(intent);
  loadResponses(intent._id);
};

async function loadResponses(intentId) {

  const list = document.getElementById("response-list");

  try {

    const responses = await window.api.get(`/responses/${intentId}`);

    if (!responses.length) {
      list.innerHTML = `<p>No responses yet</p>`;
      return;
    }

    list.innerHTML = responses.map(r => `
      <div class="chatbot-responses__item">

        <span>${r.text}</span>

        <button class="delete-btn" data-id="${r._id}">
          ✖
        </button>

      </div>
    `).join("");

    bindDeleteResponse(intentId);

  } catch (err) {
    list.innerHTML = `<p>❌ Failed to load responses</p>`;
  }
}

function bindResponseEvents(intent) {

  document.getElementById("add-response-btn").onclick = async () => {

    const input = document.getElementById("response-input");
    const text = input.value.trim();

    if (!text) return;

    try {

      await window.api.post("/responses", {
        intentId: intent._id,
        text
      });

      input.value = "";

      loadResponses(intent._id);

    } catch (err) {
      alert("❌ Failed to add response");
    }
  };
}

function bindDeleteResponse(intentId) {

  document.querySelectorAll(".delete-btn").forEach(btn => {

    btn.onclick = async () => {

      const id = btn.dataset.id;

      if (!confirm("Delete this response?")) return;

      try {

        await window.api.delete(`/responses/${id}`);

        loadResponses(intentId);

      } catch (err) {

        alert("❌ Delete failed");
      }

    };

  });
}
