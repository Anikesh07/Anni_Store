/* =========================================
   CHATBOT TEST MODULE
========================================= */

window.loadChatbotTest = async function () {

  const container = document.getElementById("chatbot-tab-content");
  if (!container) return;

  container.innerHTML = `
    <div class="dashboard-card chatbot-test">

      <div class="chatbot-test__header">
        <h2>💬 Test Chatbot</h2>
        <p>Interact with your AI assistant in real-time</p>
      </div>

      <div class="chatbot-test__chat" id="chat-window">
        <div class="chatbot-test__msg bot">
          Hello 👋 How can I help you?
        </div>
      </div>

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

/* =========================================
   EVENTS
========================================= */

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
  const sendBtn = document.getElementById("send-btn");

  const text = input.value.trim();
  if (!text) return;

  /* USER MESSAGE */
  appendMessage("user", text);

  input.value = "";
  input.disabled = true;
  sendBtn.disabled = true;

  /* ⏳ TYPING INDICATOR */
  const typingId = appendMessage("bot", "Typing...");

  try {

    const res = await window.api.post("/chatbot/message", {
      message: text
    });

    removeMessage(typingId);

    /* ✅ HANDLE RESPONSE FORMAT SAFELY */
    const replies = Array.isArray(res) ? res : [];

    if (!replies.length) {
      appendMessage("bot", "🤖 I didn’t understand that.");
    } else {

      replies.forEach(msg => {

        if (msg.type === "text") {
          appendMessage("bot", msg.text || "🤖 ...");
        }

        else if (msg.type === "image") {
          appendImage(msg.url);
        }

        else if (msg.type === "buttons") {
          appendMessage("bot", msg.text || "Choose an option:");
        }

        else {
          appendMessage("bot", "🤖 ...");
        }
      });
    }

  } catch (err) {

    removeMessage(typingId);
    appendMessage("bot", "⚠️ Chatbot not responding");
  }

  input.disabled = false;
  sendBtn.disabled = false;
  input.focus();

  scrollChat();
}

/* =========================================
   APPEND MESSAGE
========================================= */

function appendMessage(type, text) {

  const chat = document.getElementById("chat-window");

  const div = document.createElement("div");
  div.className = `chatbot-test__msg ${type}`;
  div.innerText = text;

  const id = Date.now();
  div.dataset.id = id;

  chat.appendChild(div);
  scrollChat();

  return id;
}

/* =========================================
   REMOVE MESSAGE (for typing)
========================================= */

function removeMessage(id) {

  const chat = document.getElementById("chat-window");
  const msg = chat.querySelector(`[data-id="${id}"]`);

  if (msg) msg.remove();
}

/* =========================================
   IMAGE MESSAGE
========================================= */

function appendImage(url) {

  const chat = document.getElementById("chat-window");

  const div = document.createElement("div");
  div.className = "chatbot-test__msg bot";

  const img = document.createElement("img");
  img.src = url;
  img.style.maxWidth = "200px";
  img.style.borderRadius = "8px";

  div.appendChild(img);
  chat.appendChild(div);

  scrollChat();
}

/* =========================================
   AUTO SCROLL
========================================= */

function scrollChat() {

  const chat = document.getElementById("chat-window");
  chat.scrollTop = chat.scrollHeight;
}