/* =========================================
   CHATBOT SETTINGS
========================================= */

async function loadChatbotSettings() {

  const container = document.getElementById("chatbot-tab-content");

  container.innerHTML = `
  
  <div class="dashboard-card">

    <h3>Bot Settings</h3>

    <label>Fallback Threshold</label>
    <input id="chatbot-fallback-threshold" type="number" value="0.4">

    <br><br>

    <button class="btn-primary">
      Save Settings
    </button>

  </div>

  `;

}