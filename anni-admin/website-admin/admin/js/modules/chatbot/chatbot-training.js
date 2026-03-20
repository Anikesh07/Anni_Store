/* =========================================
   CHATBOT TRAINING
========================================= */

window.loadChatbotTraining = async function () {

  const container = document.getElementById("chatbot-tab-content");

  if (!container) return;

  container.innerHTML = `

  <div class="dashboard-card">

    <h3>Training Data</h3>

    <p>Manage chatbot training examples</p>

    <button class="btn-primary">
      Add Training Example
    </button>

  </div>
  `;
};