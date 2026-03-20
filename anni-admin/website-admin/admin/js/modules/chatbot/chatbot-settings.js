/* =========================================
   CHATBOT SETTINGS
========================================= */

window.loadChatbotSettings = async function () {

  const container = document.getElementById("chatbot-tab-content");

  if (!container) return;

  container.innerHTML = `
  
  <div class="dashboard-card chatbot-settings">

    <h3>Bot Settings</h3>

    <label>Fallback Threshold</label>
    <input id="chatbot-fallback-threshold" type="number" value="0.4">

    <button class="btn-primary">
      Save Settings
    </button>

  </div>
  `;
};