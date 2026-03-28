/* =========================================
   CHATBOT TEST MODULE
   - Live chat interface
   - Connects to backend chatbot API
========================================= */

window.loadChatbotTest = async function () {

  const container = document.getElementById("chatbot-tab-content");

  if (!container) return;

  container.innerHTML = `
    <div class="dashboard-card chatbot-test">

      <!-- HEADER -->
      <div class="chatbot-test__header">
        <h2>💬 Test Chatbot</h2>
        <p>Interact with your AI assistant in real-time</p>
      </div>

      <!-- CHAT WINDOW -->
      <div class="chatbot-test__chat" id="chat-window">
        <div class="chatbot-test__msg bot">
          Hello 👋 How can I help you?
        </div>
      </div>

      <!-- INPUT -->
      <div class="chatbot-test__input">

        <input 
          type="text" 
          id="chat-input" 
          placeholder="Type a message..."
        />

        <button class="btn-primary" id="send-btn">
          Send
        </button>

      </div>

    </div>
  `;

  bindChatEvents();
};

function bindChatEvents() {

  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");

  sendBtn.onclick = sendMessage;
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}


/* =========================================
   SEND MESSAGE
========================================= */

async function sendMessage() {

  const input = document.getElementById("chat-input");
  const chat = document.getElementById("chat-window");

  const text = input.value.trim();

  if (!text) return;

  // Show user message
  appendMessage("user", text);

  input.value = "";

  try {

    const res = await window.api.post("/chatbot/message", {
      message: text
    });

    // Rasa returns array
    if (!res || res.length === 0) {
      appendMessage("bot", "🤖 I didn’t understand that.");
      return;
    }

    res.forEach(msg => {
      appendMessage("bot", msg.text);
    });

  } catch (err) {

    appendMessage("bot", "⚠️ Chatbot not responding");
  }

  scrollChat();
}

function appendMessage(type, text) {

  const chat = document.getElementById("chat-window");

  const div = document.createElement("div");
  div.className = `chatbot-test__msg ${type}`;
  div.innerText = text;

  chat.appendChild(div);
}


/* =========================================
   AUTO SCROLL
========================================= */

function scrollChat() {

  const chat = document.getElementById("chat-window");

  chat.scrollTop = chat.scrollHeight;
}

