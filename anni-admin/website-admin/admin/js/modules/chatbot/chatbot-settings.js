/* =========================================
   CHATBOT SETTINGS MODULE
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

      <div class="chatbot-settings__header">
        <h2>⚙️ Bot Settings</h2>
        <p>Control chatbot behavior and configuration</p>
      </div>

      <div class="chatbot-settings__form">

        <div class="chatbot-settings__group">
          <label>Fallback Threshold</label>
          <input 
            type="number" 
            step="0.01"
            id="fallback-threshold"
            value="${settings.fallback}"
          />
          <small>Lower = more confident responses</small>
        </div>

        <div class="chatbot-settings__group">
          <label>Bot Status</label>
          <select id="bot-status">
            <option value="ON" ${settings.status === "ON" ? "selected" : ""}>ON</option>
            <option value="OFF" ${settings.status === "OFF" ? "selected" : ""}>OFF</option>
          </select>
        </div>

        <div class="chatbot-settings__group">
          <label>Chatbot API URL</label>
          <input 
            type="text"
            id="bot-api"
            value="${settings.api}"
          />
        </div>

      </div>

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
   GET SETTINGS (SAFE PARSE)
========================================= */

function getSettings() {

  try {

    const data = localStorage.getItem("chatbotSettings");

    if (!data) return defaultSettings();

    const parsed = JSON.parse(data);

    return {
      fallback: parsed.fallback ?? 0.4,
      status: parsed.status ?? "ON",
      api: parsed.api ?? "http://localhost:5005"
    };

  } catch (err) {

    console.error("❌ Corrupted settings, resetting...");
    localStorage.removeItem("chatbotSettings");

    return defaultSettings();
  }
}

/* =========================================
   DEFAULT SETTINGS
========================================= */

function defaultSettings() {
  return {
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

  /* SAVE */
  document.getElementById("save-settings").onclick = () => {

    const fallback = parseFloat(document.getElementById("fallback-threshold").value);
    const status = document.getElementById("bot-status").value;
    const api = document.getElementById("bot-api").value.trim();

    /* ✅ VALIDATION */

    if (isNaN(fallback) || fallback < 0 || fallback > 1) {
      showNotification("⚠️ Fallback must be between 0 and 1", "info");
      return;
    }

    if (!api.startsWith("http")) {
      showNotification("⚠️ Invalid API URL", "info");
      return;
    }

    const settings = { fallback, status, api };

    saveSettings(settings);

    showNotification("✅ Settings saved", "success");
  };

  /* RESET */
  document.getElementById("reset-settings").onclick = () => {

    if (!confirm("Reset settings?")) return;

    localStorage.removeItem("chatbotSettings");

    showNotification("🔄 Settings reset", "info");

    loadChatbotSettings();
  };
}