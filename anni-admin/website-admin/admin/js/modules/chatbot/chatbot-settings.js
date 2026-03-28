/* =========================================
   CHATBOT SETTINGS MODULE
   - Manage bot configuration
   - Uses localStorage (temporary)
========================================= */

window.loadChatbotSettings = async function () {

  const container = document.getElementById("chatbot-tab-content");

  if (!container) {
    console.error("❌ chatbot-tab-content not found");
    return;
  }

  const settings = getSettings();

  container.innerHTML = `
    <div class="dashboard-card chatbot-settings">

      <!-- HEADER -->
      <div class="chatbot-settings__header">
        <h2>⚙️ Bot Settings</h2>
        <p>Control chatbot behavior and configuration</p>
      </div>

      <!-- FORM -->
      <div class="chatbot-settings__form">

        <!-- FALLBACK -->
        <div class="chatbot-settings__group">
          <label>Fallback Threshold</label>
          <input 
            type="number" 
            step="0.01"
            id="fallback-threshold"
            value="${settings.fallback || 0.4}"
          />
          <small>Lower = more confident responses</small>
        </div>

        <!-- BOT STATUS -->
        <div class="chatbot-settings__group">
          <label>Bot Status</label>
          <select id="bot-status">
            <option value="ON" ${settings.status === "ON" ? "selected" : ""}>ON</option>
            <option value="OFF" ${settings.status === "OFF" ? "selected" : ""}>OFF</option>
          </select>
        </div>

        <!-- API URL -->
        <div class="chatbot-settings__group">
          <label>Chatbot API URL</label>
          <input 
            type="text"
            id="bot-api"
            value="${settings.api || "http://localhost:5005"}"
          />
        </div>

      </div>

      <!-- ACTIONS -->
      <div class="chatbot-settings__actions">

        <button class="btn-primary" id="save-settings">
          💾 Save Settings
        </button>

        <button class="btn-secondary" id="reset-settings">
          Reset
        </button>

      </div>

    </div>
  `;

  bindSettingsEvents();
};

/* =========================================
   GET SETTINGS
========================================= */

function getSettings() {

  const data = localStorage.getItem("chatbotSettings");

  return data ? JSON.parse(data) : {
    fallback: 0.4,
    status: "ON",
    api: "http://localhost:5005"
  };
}


/* =========================================
   SAVE SETTINGS
========================================= */

function saveSettings(data) {

  localStorage.setItem("chatbotSettings", JSON.stringify(data));
}


/* =========================================
   EVENTS
========================================= */

function bindSettingsEvents() {

  // Save
  document.getElementById("save-settings").onclick = () => {

    const settings = {
      fallback: parseFloat(document.getElementById("fallback-threshold").value),
      status: document.getElementById("bot-status").value,
      api: document.getElementById("bot-api").value
    };

    saveSettings(settings);

    alert("✅ Settings saved");
  };

  // Reset
  document.getElementById("reset-settings").onclick = () => {

    if (!confirm("Reset settings?")) return;

    localStorage.removeItem("chatbotSettings");

    loadChatbotSettings();
  };
}


