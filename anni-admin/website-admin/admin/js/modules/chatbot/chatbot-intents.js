/* =========================================
   CHATBOT INTENTS
========================================= */

window.loadChatbotIntents = async function () {

  const container = document.getElementById("chatbot-tab-content");

  if (!container) return;

  container.innerHTML = `
  
  <div class="dashboard-card">

    <h3>Intent Manager</h3>

    <button class="btn-primary" id="chatbot-add-intent-btn">
      Add Intent
    </button>

    <div id="chatbot-intent-list"></div>

  </div>
  `;
};