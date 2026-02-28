/* =========================
   BOT CONFIG
   ========================= */
const BOT_API =
  window.BOT_API ||
  `${location.protocol}//${location.hostname}:5005`;

/* =========================
   SESSION (PERSISTENT)
   ========================= */
const senderId =
  localStorage.getItem("anni_bot_session") ||
  (() => {
    const id = "anni_user_" + Date.now();
    localStorage.setItem("anni_bot_session", id);
    return id;
  })();

/* =========================
   ELEMENTS (SAFE)
   ========================= */
const wrapper = document.getElementById("chatWrapper");
const quickActions = document.getElementById("quickActions");

/* =========================
   TOGGLE CHAT (FINAL FIX)
   ========================= */
function toggleChat() {
  if (!wrapper) return;

  const isOpen = wrapper.classList.toggle("show");

  // 🔔 notify parent (iframe-safe)
  try {
    window.parent.postMessage(
      isOpen ? "ANNI_BOT_OPEN" : "ANNI_BOT_CLOSE",
      "*"
    );
  } catch {}

  if (isOpen) {
    document.getElementById("userInput")?.focus();
    unlockAudio();
    showQuickActions();
  }
}

/* =========================
   🔊 SOUNDS
   ========================= */
const sendSound = document.getElementById("sendSound");
const receiveSound = document.getElementById("receiveSound");

let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked || !sendSound) return;

  sendSound.play()
    .then(() => {
      sendSound.pause();
      sendSound.currentTime = 0;
      audioUnlocked = true;
    })
    .catch(() => {});
}

function playSendSound() {
  sendSound?.play().catch(() => {});
}

function playReceiveSound() {
  receiveSound?.play().catch(() => {});
}

/* =========================
   QUICK ACTIONS
   ========================= */
function showQuickActions() {
  quickActions?.classList.remove("hidden");
}

function hideQuickActions() {
  quickActions?.classList.add("hidden");
}

function quickSend(text) {
  const input = document.getElementById("userInput");
  if (!input) return;
  input.value = text;
  sendMessage();
}

/* =========================
   SCROLL
   ========================= */
function smoothScrollToBottom() {
  const chatBody = document.getElementById("chatBody");
  chatBody?.scrollTo({
    top: chatBody.scrollHeight,
    behavior: "smooth"
  });
}

/* =========================
   TYPING BUBBLE
   ========================= */
let typingBubble = null;

function showTypingBubble() {
  const chatBody = document.getElementById("chatBody");
  if (!chatBody) return;

  typingBubble = document.createElement("div");
  typingBubble.className = "msg-row bot";

  typingBubble.innerHTML = `
    <img src="./avatars/anni-bot.png" class="avatar">
    <div class="bot-msg typing">
      <span></span><span></span><span></span>
    </div>
  `;

  chatBody.appendChild(typingBubble);
  smoothScrollToBottom();
}

function removeTypingBubble() {
  typingBubble?.remove();
  typingBubble = null;
}

/* =========================
   SEND MESSAGE
   ========================= */
async function sendMessage() {
  const input = document.getElementById("userInput");
  if (!input) return;

  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  playSendSound();
  hideQuickActions();
  input.value = "";

  showTypingBubble();

  try {
    const res = await fetch(`${BOT_API}/webhooks/rest/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: senderId,
        message
      })
    });

    if (!res.ok) throw new Error("Bot API error");

    const data = await res.json();

    setTimeout(async () => {
      removeTypingBubble();

      if (!Array.isArray(data) || !data.length) {
        appendMessage("😕 Sorry, I didn’t get a response.", "bot");
        playReceiveSound();
        showQuickActions();
        return;
      }

      for (const msg of data) {
        if (msg.text) {
          await typeBotMessage(msg.text);
        }
      }

      playReceiveSound();
      showQuickActions();
    }, 600);

  } catch (err) {
    removeTypingBubble();
    appendMessage(
      "⚠️ Bot is currently offline. Please try again later.",
      "bot"
    );
    playReceiveSound();
    showQuickActions();
  }
}

/* =========================
   MESSAGE CREATION
   ========================= */
function appendMessage(text, type) {
  const chatBody = document.getElementById("chatBody");
  if (!chatBody) return;

  const row = document.createElement("div");
  row.className = `msg-row ${type}`;

  row.innerHTML =
    type === "user"
      ? `<div class="user-msg">${text}</div>
         <img src="./avatars/user.png" class="avatar">`
      : `<img src="./avatars/anni-bot.png" class="avatar">
         <div class="bot-msg">${text}</div>`;

  chatBody.appendChild(row);
  smoothScrollToBottom();
}

/* =========================
   TYPEWRITER EFFECT
   ========================= */
function typeBotMessage(text) {
  return new Promise(resolve => {
    const chatBody = document.getElementById("chatBody");
    if (!chatBody) return resolve();

    const row = document.createElement("div");
    row.className = "msg-row bot";

    const avatar = document.createElement("img");
    avatar.src = "./avatars/anni-bot.png";
    avatar.className = "avatar";

    const bubble = document.createElement("div");
    bubble.className = "bot-msg";

    row.appendChild(avatar);
    row.appendChild(bubble);
    chatBody.appendChild(row);

    let i = 0;
    (function type() {
      if (i < text.length) {
        bubble.textContent += text[i++];
        smoothScrollToBottom();
        setTimeout(type, 18);
      } else {
        resolve();
      }
    })();
  });
}

/* =========================
   BOT STATUS
   ========================= */
const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");

async function checkBotStatus() {
  if (!statusText || !statusDot) return;

  try {
    const res = await fetch(`${BOT_API}/status`, { cache: "no-store" });
    setStatus(res.ok);
  } catch {
    setStatus(false);
  }
}

function setStatus(online) {
  statusText.textContent = online ? "Online" : "Offline";
  statusDot.classList.toggle("status-offline", !online);
}

checkBotStatus();
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) checkBotStatus();
});
