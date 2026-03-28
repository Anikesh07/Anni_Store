/* =========================================
   CHATBOT TRAINING MODULE
   - Manage training phrases
   - Based on selected intent
========================================= */

window.loadChatbotTraining = async function () {

  const container = document.getElementById("chatbot-tab-content");

  if (!container) {
    console.error("❌ chatbot-tab-content not found");
    return;
  }

  const intent = window.chatbotState?.selectedIntent;

  // ❌ No intent selected
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

  // ✅ Main UI
  container.innerHTML = `
    <div class="dashboard-card chatbot-training">

      <!-- HEADER -->
      <div class="chatbot-training__header">
        <div>
          <h2>📚 Training</h2>
          <p>Intent: <strong>${intent.name}</strong></p>
        </div>
      </div>

      <!-- ADD PHRASE -->
      <div class="chatbot-training__add">

        <input 
          id="training-input" 
          placeholder="Enter training phrase..."
        />

        <button class="btn-primary" id="add-training-btn">
          Add
        </button>

      </div>

      <!-- PHRASE LIST -->
      <div class="chatbot-training__list" id="training-list">
        Loading...
      </div>

    </div>
  `;

  bindTrainingEvents(intent);
  loadTrainingData(intent._id);
};



/* =========================================
   LOAD TRAINING PHRASES
========================================= */

async function loadTrainingData(intentId) {

  const list = document.getElementById("training-list");

  try {

    const phrases = await window.api.get(`/training/${intentId}`);

    if (!phrases.length) {
      list.innerHTML = `<p>No training phrases yet</p>`;
      return;
    }

    list.innerHTML = phrases.map(p => `
      <div class="chatbot-training__item">

        <span>${p.text}</span>

        <button 
          class="delete-btn" 
          data-id="${p._id}">
          ✖
        </button>

      </div>
    `).join("");

    bindDeleteTraining(intentId);

  } catch (err) {

    list.innerHTML = `<p>❌ Failed to load training data</p>`;
    console.error(err);
  }
}



/* =========================================
   ADD TRAINING PHRASE
========================================= */

function bindTrainingEvents(intent) {

  document.getElementById("add-training-btn").onclick = async () => {

    const input = document.getElementById("training-input");
    const text = input.value.trim();

    if (!text) return;

    try {

      await window.api.post("/training", {
        intentId: intent._id,
        text
      });

      input.value = "";

      loadTrainingData(intent._id);

    } catch (err) {

      alert("❌ Failed to add training phrase");
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

        loadTrainingData(intentId);

      } catch (err) {

        alert("❌ Delete failed");
      }

    };

  });
}