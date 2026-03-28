/* =========================================
   CHATBOT MAIN MODULE
   - Renders chatbot UI
   - Handles tab navigation
   - Provides global navigation support
========================================= */

window.loadChatbotModule = async function () {

  const section = document.getElementById("chatbot");

  if (!section) {
    console.error("❌ Chatbot section not found");
    return;
  }

  section.innerHTML = `
  
  <div class="chatbot-wrapper">

    <div class="dashboard-card chatbot-main-card">

      <!-- HEADER -->
      <div class="chatbot-header-main">
        <div>
          <h2>Chatbot Control Center</h2>
          <p>Manage AI assistant and training</p>
        </div>
      </div>

      <!-- TAB BUTTONS -->
      <div class="chatbot-tabs">

        <button class="chatbot-tab-btn active" data-tab="overview">Overview</button>
        <button class="chatbot-tab-btn" data-tab="intents">Intents</button>
        <button class="chatbot-tab-btn" data-tab="training">Training</button>
         <button class="chatbot-tab-btn" data-tab="responses">Responses</button>
        <button class="chatbot-tab-btn" data-tab="conversations">Conversations</button>
        <button class="chatbot-tab-btn" data-tab="settings">Settings</button>
        <button class="chatbot-tab-btn" data-tab="test">Test Bot</button>
       
      </div>

      <!-- CONTENT AREA -->
      <div id="chatbot-tab-content" class="chatbot-content"></div>

    </div>

  </div>
  `;

  chatbotBindTabs();

  // Default tab load
  chatbotGoTo("overview");
};



/* =========================================
   TAB BINDING
========================================= */

function chatbotBindTabs() {

  const buttons = document.querySelectorAll(".chatbot-tab-btn");

  buttons.forEach(btn => {

    btn.addEventListener("click", () => {

      const tab = btn.dataset.tab;

      chatbotGoTo(tab);

    });

  });

}



/* =========================================
   SET ACTIVE TAB
========================================= */

function setActiveTab(tab) {

  document.querySelectorAll(".chatbot-tab-btn").forEach(btn => {

    if (btn.dataset.tab === tab) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }

  });

}



/* =========================================
   TAB ROUTER
========================================= */

function chatbotLoadTab(tab) {

  const map = {
    overview: window.loadChatbotOverview,
    intents: window.loadChatbotIntents,
    training: window.loadChatbotTraining,
    conversations: window.loadChatbotConversations,
    settings: window.loadChatbotSettings,
    test: window.loadChatbotTest,
    responses: window.loadChatbotResponses

  };

  const container = document.getElementById("chatbot-tab-content");

  if (!container) {
    console.error("❌ chatbot-tab-content missing");
    return;
  }

  const fn = map[tab];

  if (typeof fn === "function") {

    try {
      fn();
    } catch (err) {

      console.error(`❌ Error loading ${tab}:`, err.message);

      container.innerHTML = `
        <div class="dashboard-card error-card">
          Failed to load "${tab}" module.
        </div>
      `;
    }

  } else {

    console.error(`❌ Tab loader not found for: ${tab}`);

    container.innerHTML = `
      <div class="dashboard-card error-card">
        Module "${tab}" not implemented.
      </div>
    `;
  }

}



/* =========================================
   GLOBAL NAVIGATION
   - Used by overview shortcuts
========================================= */

window.chatbotGoTo = function (tab) {

  setActiveTab(tab);
  chatbotLoadTab(tab);

};