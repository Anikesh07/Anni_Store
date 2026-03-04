/* ==========================================
   UNIFIED ADMIN AUTH SYSTEM
========================================== */

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 60 * 1000; // show warning 60s before logout

let inactivityTimer;
let warningTimer;
let countdownInterval;

/* ==========================================
   MAIN AUTH CHECK (RUN ON LOAD)
========================================== */

function checkAdminAuth() {

  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    redirectToLogin();
    return;
  }

  // Validate JWT structure
  let payload;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
  } catch {
    forceLogout("Invalid token structure");
    return;
  }

  // JWT expiry check
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

  // Attach logout button immediately
  attachLogoutButton();

  // Start inactivity system
  startInactivitySystem();
}

/* ==========================================
   ATTACH LOGOUT BUTTON
========================================== */

function attachLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      forceLogout("Manual logout");
    });
  }
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

  ["click", "mousemove", "keydown", "scroll"].forEach(event =>
    document.addEventListener(event, resetTimer)
  );

  stayBtn?.addEventListener("click", resetTimer);

  resetTimer();
}

/* ==========================================
   LOGOUT
========================================== */

function forceLogout(reason = "Session ended") {
  console.warn(reason);

  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("adminLoginTime");

  redirectToLogin();
}

function redirectToLogin() {
  window.location.href = "/login/index.html";
}