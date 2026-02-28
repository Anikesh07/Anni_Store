/* =========================================
   DASHBOARD CONTROLLER
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

  const token = localStorage.getItem("adminToken");

  /* =========================================
     FORCE LOGOUT (Central Control)
  ========================================= */

  function forceLogout(reason = "Session expired") {
    console.warn("Auto logout:", reason);

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("activeAdminSection");

    window.location.replace("../login/index.html");
  }

  /* =========================================
     ROUTE PROTECTION
  ========================================= */

  if (!token) {
    forceLogout("No token found");
    return;
  }

  let payload;

  try {
    payload = JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    forceLogout("Invalid token structure");
    return;
  }

  /* =========================================
     JWT EXPIRY AUTO LOGOUT
  ========================================= */

  if (payload.exp) {
    const expiryTime = payload.exp * 1000;
    const now = Date.now();
    const remaining = expiryTime - now;

    if (remaining <= 0) {
      forceLogout("Token expired");
      return;
    }

    setTimeout(() => {
      forceLogout("Token expired");
    }, remaining);
  }

/* =========================================
   INACTIVITY AUTO LOGOUT WITH WARNING
========================================= */

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 60 * 1000; // 60 seconds before logout

let inactivityTimer;
let warningTimer;
let countdownInterval;

const warningModal = document.getElementById("sessionWarning");
const countdownEl = document.getElementById("countdown");
const stayBtn = document.getElementById("stayLoggedInBtn");

function startWarningCountdown() {
  let seconds = 60;
  countdownEl.textContent = seconds;

  warningModal.classList.remove("hidden");
  warningModal.classList.add("active");

  countdownInterval = setInterval(() => {
    seconds--;
    countdownEl.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(countdownInterval);
      forceLogout("Session timeout");
    }
  }, 1000);
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  clearTimeout(warningTimer);
  clearInterval(countdownInterval);

  warningModal.classList.remove("active");
  warningModal.classList.add("hidden");

  warningTimer = setTimeout(() => {
    startWarningCountdown();
  }, INACTIVITY_LIMIT - WARNING_TIME);

  inactivityTimer = setTimeout(() => {
    forceLogout("Inactive session timeout");
  }, INACTIVITY_LIMIT);
}

["click", "mousemove", "keydown", "scroll"].forEach(event => {
  document.addEventListener(event, resetInactivityTimer);
});

stayBtn?.addEventListener("click", () => {
  resetInactivityTimer();
});

resetInactivityTimer();

  /* =========================================
     LOGOUT BUTTON
  ========================================= */

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      forceLogout("Manual logout");
    });
  }

  /* =========================================
     INITIAL OVERVIEW CONTENT
  ========================================= */

  const overview = document.getElementById("overview");

  if (overview) {
    overview.innerHTML = `
      <h1>Dashboard Overview</h1>
      <div class="card dashboard-card">
        Welcome to Anni Admin
      </div>
    `;
  }

  /* =========================================
     SECTION SWITCHING SYSTEM
  ========================================= */

  const menuItems = document.querySelectorAll(".menu-item");
  let isSwitching = false;

  async function activateSection(sectionName) {

    if (!sectionName || isSwitching) return;

    const current = document.querySelector(".section.active");
    const next = document.getElementById(sectionName);

    if (!next || current === next) return;

    isSwitching = true;

    localStorage.setItem("activeAdminSection", sectionName);

    menuItems.forEach(item =>
      item.classList.remove("active-menu")
    );

    document
      .querySelector(`.menu-item[data-section="${sectionName}"]`)
      ?.classList.add("active-menu");

    try {

      Loader?.start();

      if (current) {
        if (typeof Transition !== "undefined") {
          await Transition.fadeOut(current);
        }
        current.classList.remove("active");
      }

      next.classList.add("active");
      next.style.opacity = 0;

      const loaderFunction =
        window[`load${capitalize(sectionName)}Module`];

      if (typeof loaderFunction === "function") {
        await loaderFunction();
      }

      if (typeof Transition !== "undefined") {
        await Transition.fadeIn(next);
      } else {
        next.style.opacity = 1;
      }

    } catch (err) {
      console.error("Section load error:", err);
    } finally {
      Loader?.stop();
      isSwitching = false;
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      activateSection(item.getAttribute("data-section"));
    });
  });

  /* =========================================
     INITIAL LOAD
  ========================================= */

  const savedSection = localStorage.getItem("activeAdminSection");
  const initialSection = savedSection || "overview";

  await activateSection(initialSection);

  document.querySelector(".sidebar")?.classList.remove("loading");

});