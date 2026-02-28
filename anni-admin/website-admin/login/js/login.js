document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     SAFE ELEMENT SELECTION
  ========================================================= */

  const form = document.getElementById("authForm");
  const toggleBtn = document.getElementById("toggleBtn");
  const toggleText = document.getElementById("toggleText");
  const formTitle = document.getElementById("formTitle");
  const submitBtn = document.getElementById("submitBtn");
  const errorMsg = document.getElementById("errorMsg");
  const nameGroup = document.getElementById("nameGroup");

  if (!form || !submitBtn) return; // stop if DOM not ready

  const btnText = submitBtn.querySelector(".btn-text");
  const btnLoader = submitBtn.querySelector(".btn-loader");

  let isLogin = true;
  const LOADER_DURATION = 3000;

  /* =========================================================
     SKELETON REVEAL
  ========================================================= */

  window.addEventListener("load", () => {
    const skeleton = document.getElementById("loginSkeleton");
    const container = document.getElementById("loginContainer");

    if (!skeleton || !container) return;

    setTimeout(() => {
      skeleton.style.opacity = "0";
      skeleton.style.transition = "opacity 0.4s ease";

      setTimeout(() => {
        skeleton.remove();
        container.classList.remove("hidden");
      }, 400);

    }, 700);
  });

  /* =========================================================
     AUTO REDIRECT IF TOKEN EXISTS
  ========================================================= */

  const existingToken = sessionStorage.getItem("adminToken");
  if (existingToken && existingToken.length > 20) {
    window.location.href = "../admin/dashboard.html";
    return;
  }

  /* =========================================================
     TOGGLE LOGIN / SIGNUP
  ========================================================= */

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      isLogin = !isLogin;

      if (isLogin) {
        formTitle.textContent = "Admin Login";
        btnText.textContent = "LOGIN";
        toggleText.textContent = "Don't have an account?";
        toggleBtn.textContent = "Sign Up";
        nameGroup?.classList.add("hidden");
      } else {
        formTitle.textContent = "Admin Sign Up";
        btnText.textContent = "SIGN UP";
        toggleText.textContent = "Already have an account?";
        toggleBtn.textContent = "Login";
        nameGroup?.classList.remove("hidden");
      }

      errorMsg.textContent = "";
      errorMsg.style.color = "#c2410c";
    });
  }

  /* =========================================================
     HANDLE FORM SUBMIT
  ========================================================= */

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!email || !password) {
      errorMsg.textContent = "Email and password are required";
      return;
    }

    const endpoint = isLogin
      ? "http://localhost:4000/api/auth/login"
      : "http://localhost:4000/api/auth/register";

    const payload = isLogin
      ? { email, password }
      : { name, email, password, role: "website_admin" };

    try {

      /* ==============================
         START LOADING STATE
      ============================== */

      submitBtn.disabled = true;
      btnLoader?.classList.remove("hidden");
      btnText.textContent = isLogin ? "Signing in..." : "Creating...";
      errorMsg.textContent = "";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

/* ==============================
   LOGIN SUCCESS
============================== */

if (isLogin) {

  // Store token in sessionStorage (clears when browser closes)
  sessionStorage.setItem("adminToken", data.token);

  // Store login timestamp
  sessionStorage.setItem("adminLoginTime", Date.now().toString());

  const overlay = document.getElementById("authLoaderOverlay");
  const card = document.querySelector(".auth-card");

  if (overlay && card) {
    overlay.classList.remove("hidden");
    overlay.classList.add("active");
    card.style.opacity = "0";

    await new Promise(resolve =>
      setTimeout(resolve, LOADER_DURATION)
    );
  }

  window.location.href = "../admin/dashboard.html";
}

      /* ==============================
         SIGNUP SUCCESS
      ============================== */

      else {
        errorMsg.style.color = "green";
        errorMsg.textContent =
          "Account created successfully! Please login.";

        submitBtn.disabled = false;
        btnLoader?.classList.add("hidden");
        btnText.textContent = "LOGIN";

        toggleBtn.click();
      }

    } catch (err) {

      errorMsg.style.color = "#c2410c";
      errorMsg.textContent =
        err.message || "Server error. Please try again.";

      submitBtn.disabled = false;
      btnLoader?.classList.add("hidden");
      btnText.textContent = isLogin ? "LOGIN" : "SIGN UP";
    }
  });

});