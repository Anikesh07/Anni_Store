/* =========================================
   CHATBOT OVERVIEW MODULE
========================================= */

window.loadChatbotOverview = async function () {

  console.log("✅ Chatbot Overview Loaded");

  const container = document.getElementById("chatbot-tab-content");

  if (!container) {
    console.error("❌ chatbot-tab-content not found");
    return;
  }

  container.innerHTML = `
    <div class="dashboard-card">
      <h2>Chatbot Overview</h2>
      <p>Bot is working 🚀</p>
    </div>
  `;
};    