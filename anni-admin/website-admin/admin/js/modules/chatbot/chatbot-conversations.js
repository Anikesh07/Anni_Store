/* =========================================
   CHATBOT CONVERSATIONS
========================================= */

async function loadChatbotConversations() {

  const container = document.getElementById("chatbot-tab-content");

  container.innerHTML = `
  
  <div class="dashboard-card">

    <h3>Conversation Logs</h3>

    <div id="chatbot-conversation-table"></div>

  </div>

  `;

}