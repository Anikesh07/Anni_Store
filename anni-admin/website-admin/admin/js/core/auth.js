/* ==========================================
   UNIFIED ADMIN AUTH SYSTEM
========================================== */

const INACTIVITY_LIMIT = 15 * 60 * 1000;
const WARNING_TIME = 60 * 1000;

let inactivityTimer = null;
let warningTimer = null;
let countdownInterval = null;


/* ==========================================
   MAIN AUTH CHECK
========================================== */

function checkAdminAuth() {

  const token = sessionStorage.getItem("adminToken");

  if (!token || token.length < 20) {
    redirectToLogin();
    return;
  }

  let payload;

  try {

    const base64Payload = token.split(".")[1];

    if (!base64Payload) throw new Error("Invalid token");

    payload = JSON.parse(atob(base64Payload));

  } catch (err) {

    console.warn("Invalid token format");

    forceLogout("Invalid token");
    return;

  }

  /* JWT expiry check */

  if (payload.exp) {

    const expiryTime = payload.exp * 1000;
    const now = Date.now();

    if (now >= expiryTime) {
      forceLogout("Token expired");
      return;
    }

    setTimeout(() => {
      forceLogout("Token expired");
    }, expiryTime - now);

  }

  attachLogoutButton();
  startInactivitySystem();

}


/* ==========================================
   LOGOUT BUTTON
========================================== */

function attachLogoutButton() {

  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.onclick = () => {
    forceLogout("Manual logout");
  };

}


/* ==========================================
   INACTIVITY SYSTEM
========================================== */

function startInactivitySystem() {

  const warningModal = document.getElementById("sessionWarning");
  const countdownEl = document.getElementById("countdown");
  const stayBtn = document.getElementById("stayLoggedInBtn");

  function startWarningCountdown() {

    let seconds = 60;

    if (!countdownEl) return;

    countdownEl.textContent = seconds;

    warningModal?.classList.remove("hidden");
    warningModal?.classList.add("active");

    countdownInterval = setInterval(() => {

      seconds--;
      countdownEl.textContent = seconds;

      if (seconds <= 0) {

        clearInterval(countdownInterval);
        forceLogout("Inactive session");

      }

    }, 1000);

  }


  function resetTimer() {

    clearTimeout(inactivityTimer);
    clearTimeout(warningTimer);
    clearInterval(countdownInterval);

    warningModal?.classList.remove("active");
    warningModal?.classList.add("hidden");

    warningTimer = setTimeout(() => {
      startWarningCountdown();
    }, INACTIVITY_LIMIT - WARNING_TIME);

    inactivityTimer = setTimeout(() => {
      forceLogout("Inactive session");
    }, INACTIVITY_LIMIT);

  }

  ["click","mousemove","keydown","scroll"].forEach(event => {
    document.addEventListener(event, resetTimer);
  });

  stayBtn?.addEventListener("click", resetTimer);

  resetTimer();

}


/* ==========================================
   FORCE LOGOUT
========================================== */

function forceLogout(reason = "Session ended") {

  console.warn(reason);

  clearTimeout(inactivityTimer);
  clearTimeout(warningTimer);
  clearInterval(countdownInterval);

  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("adminLoginTime");

  redirectToLogin();

}


/* ==========================================
   REDIRECT
========================================== */

function redirectToLogin() {

  window.location.href = "/login/index.html";

}


/* ==========================================
   AUTO INIT
========================================== */

document.addEventListener("DOMContentLoaded", checkAdminAuth);