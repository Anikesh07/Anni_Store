/* =========================================
   CHATBOT CONVERSATIONS MODULE
   - Display chat logs
========================================= */

window.loadChatbotConversations = async function () {

  const container = document.getElementById("chatbot-tab-content");

  if (!container) return;

  container.innerHTML = `
    <div class="dashboard-card chatbot-conversations">

      <!-- HEADER -->
      <div class="chatbot-conversations__header">
        <h2>💬 Conversation Logs</h2>
      </div>

      <!-- LIST -->
      <div class="chatbot-conversations__list" id="conversation-list">
        Loading conversations...
      </div>

    </div>
  `;

  loadConversations();
};

async function loadConversations() {

  const list = document.getElementById("conversation-list");

  try {

    const conversations = await window.api.get("/chatbot/conversations");

    if (!conversations.length) {
      list.innerHTML = `<p>No conversations yet</p>`;
      return;
    }

    list.innerHTML = conversations.map(conv => `
      <div class="chatbot-conversations__card">

        <div class="chatbot-conversations__messages">
          ${conv.messages.map(msg => `
            <div class="chatbot-conversations__msg chatbot-conversations__msg--${msg.sender}">
              ${msg.text}
            </div>
          `).join("")}
        </div>

        <div class="chatbot-conversations__meta">
          ${new Date(conv.createdAt).toLocaleString()}
        </div>

      </div>
    `).join("");

  } catch (err) {

    console.error(err);
    list.innerHTML = `<p>❌ Failed to load conversations</p>`;
  }
}