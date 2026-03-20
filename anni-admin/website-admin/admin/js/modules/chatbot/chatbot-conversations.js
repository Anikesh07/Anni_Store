/* =========================================
   CHATBOT CONVERSATIONS
========================================= */

window.loadChatbotConversations = async function () {

  const container = document.getElementById("chatbot-tab-content");

  if (!container) return;

  container.innerHTML = `
  
  <div class="dashboard-card">

    <h3>Conversation Logs</h3>

    <div id="chatbot-conversation-table"></div>

  </div>
  `;
};