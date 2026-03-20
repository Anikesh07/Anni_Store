/* =========================================
   CHATBOT MAIN MODULE
========================================= */

window.loadChatbotModule = async function () {

  const section = document.getElementById("chatbot");

  if (!section) {
    console.error("❌ Chatbot section not found");
    return;
  }

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

      <!-- CONTENT AREA -->
      <div id="chatbot-tab-content"></div>

    </div>

  </div>
  `;

  chatbotBindTabs();

  // Safe load default tab
  chatbotLoadTab("overview");
};



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

      chatbotLoadTab(tab);

    });

  });

}



/* =========================================
   TAB ROUTER (CLEAN VERSION)
========================================= */

function chatbotLoadTab(tab) {

  const map = {
    overview: window.loadChatbotOverview,
    intents: window.loadChatbotIntents,
    training: window.loadChatbotTraining,
    conversations: window.loadChatbotConversations,
    settings: window.loadChatbotSettings
  };

  const fn = map[tab];

  if (typeof fn === "function") {
    fn();
  } else {
    console.error(`❌ Tab loader not found for: ${tab}`);

    const container = document.getElementById("chatbot-tab-content");
    if (container) {
      container.innerHTML = `
        <div class="dashboard-card">
          Failed to load "${tab}" module.
        </div>
      `;
    }
  }

} 