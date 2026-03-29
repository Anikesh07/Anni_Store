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

    <div class="dashboard-card chatbot-main-card">

      <div class="chatbot-header-main">
        <div>
          <h2>Chatbot Control Center</h2>
          <p>Manage AI assistant and training</p>
        </div>
      </div>

      <div class="chatbot-tabs">

        <button class="chatbot-tab-btn active" data-tab="overview">Overview</button>
        <button class="chatbot-tab-btn" data-tab="intents">Intents</button>
        <button class="chatbot-tab-btn" data-tab="training">Training</button>
        <button class="chatbot-tab-btn" data-tab="responses">Responses</button>
        <button class="chatbot-tab-btn" data-tab="conversations">Conversations</button>
        <button class="chatbot-tab-btn" data-tab="settings">Settings</button>
        <button class="chatbot-tab-btn" data-tab="test">Test Bot</button>

      </div>

      <div id="chatbot-tab-content" class="chatbot-content">
        ⏳ Loading...
      </div>

    </div>

  </div>
  `;

  chatbotBindTabs();

  // ✅ Restore last tab (or default)
  const lastTab = sessionStorage.getItem("chatbotActiveTab") || "overview";
  chatbotGoTo(lastTab);
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

    btn.classList.toggle("active", btn.dataset.tab === tab);

  });
}

/* =========================================
   TAB ROUTER
========================================= */

async function chatbotLoadTab(tab) {

  const map = {
    overview: window.loadChatbotOverview,
    intents: window.loadChatbotIntents,
    training: window.loadChatbotTraining,
    responses: window.loadChatbotResponses,
    conversations: window.loadChatbotConversations,
    settings: window.loadChatbotSettings,
    test: window.loadChatbotTest
  };

  const container = document.getElementById("chatbot-tab-content");

  if (!container) {
    console.error("❌ chatbot-tab-content missing");
    return;
  }

  const fn = map[tab];

  if (typeof fn === "function") {

    try {

      // ⏳ loading state
      container.innerHTML = `<p>⏳ Loading ${tab}...</p>`;

      // ✅ support async modules
      await Promise.resolve(fn());

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
========================================= */

window.chatbotGoTo = function (tab) {

  // ✅ persist tab
  sessionStorage.setItem("chatbotActiveTab", tab);

  setActiveTab(tab);
  chatbotLoadTab(tab);

};