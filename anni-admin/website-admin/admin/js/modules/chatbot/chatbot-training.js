/* =========================================
   CHATBOT TRAINING
========================================= */

async function loadChatbotTraining() {

  const container = document.getElementById("chatbot-tab-content");

  container.innerHTML = `

  <div class="dashboard-card">

    <h3>Training Data</h3>

    <p>Manage chatbot training examples</p>

    <button class="btn-primary">
      Add Training Example
    </button>

  </div>

  `;

}