/* =========================================
   CHATBOT CONVERSATIONS MODULE
========================================= */

window.loadChatbotConversations = async function () {

  const container = document.getElementById("chatbot-tab-content");

  if (!container) return;

  container.innerHTML = `
    <div class="dashboard-card chatbot-conversations">

      <div class="chatbot-conversations__header">
        <h2>💬 Conversation Logs</h2>
      </div>

      <div class="chatbot-conversations__list" id="conversation-list">
        ⏳ Loading conversations...
      </div>

    </div>
  `;

  loadConversations();
};

/* =========================================
   LOAD CONVERSATIONS
========================================= */

async function loadConversations() {

  const list = document.getElementById("conversation-list");

  list.innerHTML = `<p>⏳ Loading conversations...</p>`;

  try {

    const res = await window.api.get("/chatbot/conversations");

    // ✅ handle both formats
    const conversations = Array.isArray(res) ? res : res?.data || [];

    if (!conversations.length) {
      list.innerHTML = `<p>No conversations yet</p>`;
      return;
    }

    list.innerHTML = conversations.map(conv => {

      const messages = Array.isArray(conv.messages) ? conv.messages : [];

      return `
        <div class="chatbot-conversations__card">

          <div class="chatbot-conversations__messages">
            ${messages.map(msg => {

              const sender = msg.sender === "user" ? "user" : "bot";
              const text = msg.text || "";

              return `
                <div class="chatbot-conversations__msg chatbot-conversations__msg--${sender}">
                  ${escapeHTML(text)}
                </div>
              `;
            }).join("")}
          </div>

          <div class="chatbot-conversations__meta">
            ${formatDate(conv.createdAt)}
          </div>

        </div>
      `;
    }).join("");

  } catch (err) {

    console.error(err);
    showNotification("❌ Failed to load conversations", "error");

    list.innerHTML = `<p>❌ Failed to load conversations</p>`;
  }
}

/* =========================================
   HELPERS
========================================= */

// 🔐 prevent XSS (important)
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// 🕒 safe date formatting
function formatDate(date) {
  try {
    return new Date(date).toLocaleString();
  } catch {
    return "Unknown date";
  }
}