/* =========================================
   CHATBOT OVERVIEW DASHBOARD
========================================= */

function showNotification(message, type = "info") {

  let container = document.getElementById("notification-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    document.body.appendChild(container);
  }

  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.innerText = message;

  container.appendChild(notif);

  setTimeout(() => {
    notif.remove();
  }, 3000);
}


/* =========================================
   CHATBOT OVERVIEW 
========================================= */

window.loadChatbotOverview = async function () {

  const container = document.getElementById("chatbot-tab-content");

  if (!container) {
    console.error("❌ chatbot-tab-content not found");
    return;
  }

  container.innerHTML = `
    <div class="dashboard-card chatbot-overview">

      <!-- HEADER -->
      <div class="chatbot-overview__header">
        <div>
          <h2>🤖 Chatbot Dashboard</h2>
          <p id="chatbot-status">Checking chatbot status...</p>
          <small id="last-trained">Last trained: --</small>
        </div>
      </div>

      <!-- STATS -->
      <div class="chatbot-overview__stats">

        <div class="chatbot-overview__stat">
          <h3 id="stat-intents">0</h3>
          <p>Total Intents</p>
        </div>

        <div class="chatbot-overview__stat">
          <h3 id="stat-training">0</h3>
          <p>Training Phrases</p>
        </div>

        <div class="chatbot-overview__stat">
          <h3 id="stat-conversations">0</h3>
          <p>Conversations</p>
        </div>

      </div>

      <!-- ACTIONS -->
      <div class="chatbot-overview__actions">

        <button class="btn-primary" id="train-btn">
          🚀 Train Bot
        </button>

        <button class="btn-secondary" id="start-bot">
          ▶ Start Bot
        </button>

        <button class="btn-secondary" id="stop-bot">
          ⏹ Stop Bot
        </button>

        <button class="btn-secondary" id="restart-bot">
          🔄 Restart Bot
        </button>

        <button class="btn-secondary" id="test-btn">
          💬 Test Bot
        </button>

      </div>

      <!-- 🧾 LIVE CONSOLE -->
      <div class="chatbot-overview__console">
  <h4>🧾 Live Console</h4>

  <button id="copy-logs" class="copy-logs-btn">📋 Copy Logs</button>

  <div id="chatbot-console" class="chatbot-console">
    <div>🟢 Console ready...</div>
  </div>
</div>

      <!-- FEATURE CARDS -->
      <div class="chatbot-overview__features">

        <div class="chatbot-overview__feature" data-go="intents">
          <h4>🧠 Intents</h4>
          <p>Create and manage chatbot intents</p>
        </div>

        <div class="chatbot-overview__feature" data-go="training">
          <h4>📚 Training</h4>
          <p>Add phrases and improve responses</p>
        </div>

        <div class="chatbot-overview__feature" data-go="conversations">
          <h4>💬 Conversations</h4>
          <p>View chat logs and user queries</p>
        </div>

      </div>

    </div>
  `;

  bindOverviewEvents();
  bindCopyLogs();
  loadOverviewStats();
  checkBotStatus();
  startBotStatusWatcher();
  startLiveConsole();
};


/* =========================================
   LIVE CONSOLE (FROM API)
========================================= */

let consoleInterval = null;

function startLiveConsole() {

  // 🔥 Always clear old interval (fix duplicate spam)
  if (consoleInterval) {
    clearInterval(consoleInterval);
  }

  consoleInterval = setInterval(async () => {

    try {

      const logs = await window.api.get("/chatbot/logs", { silent: true });

      const box = document.getElementById("chatbot-console");
      if (!box) return;

      // ✅ lighter comparison (faster than JSON.stringify)
      const newContent = logs.join("");

      if (box.dataset.lastLogs === newContent) return;

      box.dataset.lastLogs = newContent;
      box.innerHTML = "";

      logs.forEach(log => {

        const line = document.createElement("div");

        // 🎨 use CSS classes instead of inline styles
        if (log.includes("❌")) line.className = "log-error";
        else if (log.includes("✅")) line.className = "log-success";
        else if (log.includes("⚠️")) line.className = "log-warning";
        else line.className = "log-info";

        line.innerText = log;
        box.appendChild(line);
      });

      box.scrollTop = box.scrollHeight;

    } catch (err) {

      console.error("❌ Live console failed:", err.message);

      const box = document.getElementById("chatbot-console");
      if (!box) return;

      const errLine = document.createElement("div");
      errLine.className = "console-error";
      errLine.innerText = "⚠️ Console error";

      box.appendChild(errLine);
    }

  }, 4000);
}


/* =========================================
   COPY LOGS TO CLIPBOARD
========================================= */

function bindCopyLogs() {

  const copyBtn = document.getElementById("copy-logs");

  if (!copyBtn) return;

  copyBtn.onclick = async () => {

    try {

      const text = document.getElementById("chatbot-console")?.innerText;

      if (!text || text.trim() === "") {
        showNotification("⚠️ No logs to copy", "info");
        return;
      }

      await navigator.clipboard.writeText(text);

      showNotification("📋 Logs copied", "success");

    } catch (err) {

      console.error("❌ Copy failed:", err);

      showNotification("❌ Failed to copy logs", "error");
    }
  };
}


/* =========================================
   EVENT BINDINGS
========================================= */

function bindOverviewEvents() {

  /* 🚀 TRAIN */
  const trainBtn = document.getElementById("train-btn");

  if (trainBtn) {
    trainBtn.onclick = async () => {

      try {
        trainBtn.disabled = true;
        trainBtn.innerText = "⏳ Training...";

        const res = await window.api.post("/chatbot/train");

        showNotification(res.message || "Training completed", "success");

        document.getElementById("last-trained").innerText =
          "Last trained: " + new Date().toLocaleString();

      } catch (err) {
        showNotification("❌ " + (err.message || err), "error");
      } finally {
        trainBtn.disabled = false;
        trainBtn.innerText = "🚀 Train Bot";
      }
    };
  }


function updateBotButtons(isRunning) {

  document.getElementById("start-bot").disabled = isRunning;
  document.getElementById("stop-bot").disabled = !isRunning;
}



  /* ▶ START */
  document.getElementById("start-bot")?.addEventListener("click", async () => {

  showNotification("⏳ Starting bot...", "info");

  await window.api.post("/chatbot/start");

  const success = await waitForBotState("running");

  if (success) {
    showNotification("🟢 Bot is now running", "success");
  } else {
    showNotification("⚠️ Bot is taking longer than expected", "info");
  }

  checkBotStatus();
});

  /* ⏹ STOP */
  document.getElementById("stop-bot")?.addEventListener("click", async () => {

  showNotification("⏳ Stopping bot...", "info");

  await window.api.post("/chatbot/stop");

  const success = await waitForBotState("stopped");

  if (success) {
    showNotification("🔴 Bot stopped", "error");
  } else {
    showNotification("⚠️ Bot is taking longer than expected", "info");
  }

  checkBotStatus();
});

  /* 🔄 RESTART */
  document.getElementById("restart-bot")?.addEventListener("click", async () => {

  showNotification("⏳ Restarting bot...", "info");

  await window.api.post("/chatbot/restart");

  const success = await waitForBotState("running");

  if (success) {
    showNotification("🔵 Bot restarted successfully", "info");
  } else {
    showNotification("⚠️ Bot is taking longer than expected", "info");
  }

  checkBotStatus();
});



/* =========================================
   TEST BOT NAVIGATION
========================================= */
document.getElementById("test-btn")?.addEventListener("click", () => {

  try {
    chatbotGoTo("test");
    showNotification("💬 Opening test chatbot...", "info");
  } catch (err) {
    console.error("❌ Navigation error:", err);
    showNotification("❌ Failed to open chatbot", "error");
  }

});


/* =========================================
   FEATURE NAVIGATION
========================================= */
document.querySelectorAll(".chatbot-overview__feature").forEach(card => {

  card.addEventListener("click", () => {

    const target = card.dataset.go;

    if (!target) {
      showNotification("⚠️ Invalid navigation target", "error");
      return;
    }

    try {
      chatbotGoTo(target);
      showNotification(`➡️ Opening ${target}...`, "info");
    } catch (err) {
      console.error("❌ Navigation error:", err);
      showNotification("❌ Navigation failed", "error");
    }

  });

});
}


/* =========================================
   LOAD STATS
========================================= */

async function loadOverviewStats() {
  try {
    const intents = await window.api.get("/intents");
    document.getElementById("stat-intents").innerText = intents.length;
  } catch (err) {
    console.error(err.message);
  }
}


/* =========================================
   BOT STATUS
========================================= */

async function checkBotStatus() {

  const el = document.getElementById("chatbot-status");

  if (!el) return;

  try {

    const res = await fetch("http://localhost:4000/api/chatbot/health", {
      method: "GET",
      cache: "no-cache"
    });

    const data = await res.json();

    const statusText = data.status || "❌ Unknown status";

    el.innerText = statusText;

    /* =========================
       STATUS LOGIC
    ========================= */

    const isRunning = statusText.toLowerCase().includes("running");

    // 🎨 Color update
    el.style.color = isRunning ? "#22c55e" : "#ef4444";

    // 🔥 Button sync (IMPORTANT)
    const startBtn = document.getElementById("start-bot");
    const stopBtn = document.getElementById("stop-bot");

    if (startBtn) startBtn.disabled = isRunning;
    if (stopBtn) stopBtn.disabled = !isRunning;

  } catch (err) {

    console.error("❌ Status check failed:", err.message);

    el.innerText = "❌ Chatbot not reachable";
    el.style.color = "#ef4444";

    // disable stop button when unreachable
    const startBtn = document.getElementById("start-bot");
    const stopBtn = document.getElementById("stop-bot");

    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
  }
}

/* =========================================
  STATUS WATCHER (AUTO-REFRESH)
========================================= */


let statusInterval = null;

function startBotStatusWatcher() {

  if (statusInterval) return;

  statusInterval = setInterval(async () => {

    const el = document.getElementById("chatbot-status");

    try {

      const res = await fetch("http://localhost:4000/api/chatbot/health");
      const data = await res.json();

      el.innerText = data.status;

      const isRunning = data.status.includes("running");

      // 🎨 color update
      el.style.color = isRunning ? "#22c55e" : "#ef4444";

      // 🔥 button sync
      document.getElementById("start-bot").disabled = isRunning;
      document.getElementById("stop-bot").disabled = !isRunning;

    } catch {

      el.innerText = "❌ Chatbot not reachable";
      el.style.color = "#ef4444";

    }

  }, 3000);
}


/* =========================================
    WAIT FOR BOT STATE (HELPER)
========================================= */


async function waitForBotState(expectedState, timeout = 30000) {

  const start = Date.now();
  let warned = false;

  while (Date.now() - start < timeout) {

    try {
      const res = await fetch("http://localhost:4000/api/chatbot/health");
      const data = await res.json();

      const status = (data.status || "").toLowerCase();

      if (expectedState === "running" && status.includes("running")) {
        return true;
      }

      if (expectedState === "stopped" && status.includes("not")) {
        return true;
      }

    } catch {}

    // ⏳ After 10 sec → show patience message
    if (!warned && Date.now() - start > 10000) {
      showNotification("⏳ Still starting... please wait", "info");
      warned = true;
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  return false;
}