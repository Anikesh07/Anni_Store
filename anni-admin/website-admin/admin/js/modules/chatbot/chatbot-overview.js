/* =========================================
   CHATBOT OVERVIEW DASHBOARD
========================================= */


/* =========================================
    UPDATE BOT CONTROL BUTTONS
========================================= */


function updateBotButtons(isRunning) {

  const startBtn = document.getElementById("start-bot");
  const stopBtn = document.getElementById("stop-bot");

  if (startBtn) startBtn.disabled = isRunning;
  if (stopBtn) stopBtn.disabled = !isRunning;

}


/* =========================================
    NOTIFICATIONS
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

  if (consoleInterval) {
    clearInterval(consoleInterval);
  }

  consoleInterval = setInterval(async () => {

    const box = document.getElementById("chatbot-console");
    if (!box) return;

    try {

      const logs = await window.api.get("/chatbot/logs");

      // ✅ safety check
      if (!Array.isArray(logs)) return;

      const newContent = logs.join("\n");

      // ✅ prevent unnecessary re-render
      if (box.dataset.lastLogs === newContent) return;

      box.dataset.lastLogs = newContent;

      // ✅ clear error state if recovered
      delete box.dataset.errorShown;

      box.innerHTML = "";

      logs.forEach(log => {

        const line = document.createElement("div");

        if (log.includes("❌")) line.className = "log-error";
        else if (log.includes("✅")) line.className = "log-success";
        else if (log.includes("⚠️")) line.className = "log-warning";
        else line.className = "log-info";

        line.innerText = log;
        box.appendChild(line);
      });

      box.scrollTop = box.scrollHeight;

    } catch (err) {

      console.warn("⚠️ Console temporarily unavailable");

      // ✅ show error ONLY ONCE (no spam)
      if (!box.dataset.errorShown) {

        box.dataset.errorShown = "true";

        const errLine = document.createElement("div");
        errLine.className = "console-error";
        errLine.innerText = "⚠️ Waiting for backend...";

        box.appendChild(errLine);
      }
    }

  }, 3000); // slightly faster & smoother
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
        showNotification("🚀 Training started...", "info");

        const res = await window.api.post("/chatbot/train");

        showNotification(res?.message || "Training completed", "success");

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



  /* ▶ START */
  document.getElementById("start-bot")?.addEventListener("click", async () => {

  showNotification("⏳ Starting bot...", "info");

  try {
  await window.api.post("/chatbot/start");
} catch (err) {
  showNotification("❌ Failed to start bot", "error");
  return;
}

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

    // ✅ use your API helper (stop mixing fetch like a rebel)
    const data = await window.api.get("/chatbot/health");

    const isRunning = data.status === "running";

    // ✅ FIX: declare BEFORE using
    const statusText = isRunning ? "🟢 Running" : "🔴 Stopped";

    el.innerText = statusText;

    // 🎨 color
    el.style.color = isRunning ? "#22c55e" : "#ef4444";

    // 🔥 button sync
    updateBotButtons(isRunning);

  } catch (err) {

    console.error("❌ Status check failed:", err.message);

    el.innerText = "❌ Chatbot not reachable";
    el.style.color = "#ef4444";

    // fallback button state
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

  if (statusInterval) clearInterval(statusInterval);

  statusInterval = setInterval(async () => {

    const el = document.getElementById("chatbot-status");
    if (!el) return;

    try {

      // ✅ FIX: api already returns parsed JSON
      const data = await window.api.get("/chatbot/health");

      const isRunning = data.status === "running";

      const statusText = isRunning ? "🟢 Running" : "🔴 Stopped";

      el.innerText = statusText;

      // 🎨 color
      el.style.color = isRunning ? "#22c55e" : "#ef4444";

      // 🔥 button sync (clean way)
      updateBotButtons(isRunning);

    } catch (err) {

      console.error("❌ Status watcher failed:", err.message);

      el.innerText = "❌ Chatbot not reachable";
      el.style.color = "#ef4444";

      const startBtn = document.getElementById("start-bot");
      const stopBtn = document.getElementById("stop-bot");

      if (startBtn) startBtn.disabled = false;
      if (stopBtn) stopBtn.disabled = true;
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

      // ✅ FIX: DO NOT use .json()
      const data = await window.api.get("/chatbot/health");

      const status = (data.status || "").toLowerCase();

      if (expectedState === "running" && status === "running") {
        return true;
      }

      if (expectedState === "stopped" && status === "stopped") {
        return true;
      }

    } catch (err) {
      // silent retry (fine)
    }

    // ⏳ After 10 sec → show patience message
    if (!warned && Date.now() - start > 10000) {
      showNotification("⏳ Still starting... please wait", "info");
      warned = true;
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  return false;
}