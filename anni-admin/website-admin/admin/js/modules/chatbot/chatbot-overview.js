/* =========================================
   CHATBOT MAIN MODULE
========================================= */

async function loadChatbotModule() {

  const section = document.getElementById("chatbot");

  if (!section) return;

  section.innerHTML = `
  
  <div class="chatbot-wrapper">

    <div class="dashboard-card">

      <h2>Chatbot Control Center</h2>
      <p>Manage AI assistant and training</p>

      <div class="chatbot-tabs">

        <button class="chatbot-tab-btn active" data-tab="overview">
          Overview
        </button>

        <button class="chatbot-tab-btn" data-tab="intents">
          Intents
        </button>

        <button class="chatbot-tab-btn" data-tab="training">
          Training
        </button>

        <button class="chatbot-tab-btn" data-tab="conversations">
          Conversations
        </button>

        <button class="chatbot-tab-btn" data-tab="settings">
          Settings
        </button>

      </div>

      <div id="chatbot-tab-content"></div>

    </div>

  </div>
  `;

  chatbotBindTabs();

  loadChatbotOverview();

}

window.loadChatbotModule = loadChatbotModule;


/* =========================================
   TAB HANDLER
========================================= */

function chatbotBindTabs() {

  const buttons = document.querySelectorAll(".chatbot-tab-btn");

  buttons.forEach(btn => {

    btn.addEventListener("click", () => {

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const tab = btn.dataset.tab;

      if (tab === "overview") loadChatbotOverview();
      if (tab === "intents") loadChatbotIntents();
      if (tab === "training") loadChatbotTraining();
      if (tab === "conversations") loadChatbotConversations();
      if (tab === "settings") loadChatbotSettings();

    });

  });

}