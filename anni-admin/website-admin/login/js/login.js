const form = document.getElementById("authForm");
const toggleBtn = document.getElementById("toggleBtn");
const toggleText = document.getElementById("toggleText");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const errorMsg = document.getElementById("errorMsg");
const nameGroup = document.getElementById("nameGroup");

const btnText = submitBtn.querySelector(".btn-text");
const btnLoader = submitBtn.querySelector(".btn-loader");

let isLogin = true;
const LOADER_DURATION = 3000; // 🔥 Change this to control animation time


window.addEventListener("load", () => {

  const skeleton = document.getElementById("loginSkeleton");
  const container = document.getElementById("loginContainer");

  // Smooth controlled reveal
  setTimeout(() => {
    skeleton.style.opacity = "0";
    skeleton.style.transition = "opacity 0.4s ease";

    setTimeout(() => {
      skeleton.remove();
      container.classList.remove("hidden");
    }, 400);

  }, 700); // adjust timing here
});


/* =========================================================
   TOGGLE LOGIN / SIGNUP
========================================================= */

toggleBtn.addEventListener("click", () => {
  isLogin = !isLogin;

  if (isLogin) {
    formTitle.textContent = "Admin Login";
    btnText.textContent = "LOGIN";
    toggleText.textContent = "Don't have an account?";
    toggleBtn.textContent = "Sign Up";
    nameGroup.classList.add("hidden");
  } else {
    formTitle.textContent = "Admin Sign Up";
    btnText.textContent = "SIGN UP";
    toggleText.textContent = "Already have an account?";
    toggleBtn.textContent = "Login";
    nameGroup.classList.remove("hidden");
  }

  errorMsg.textContent = "";
  errorMsg.style.color = "#c2410c";
});

/* =========================================================
   AUTO REDIRECT IF LOGGED IN
========================================================= */

window.addEventListener("DOMContentLoaded", () => {
  const existingToken = localStorage.getItem("adminToken");
  if (existingToken) {
    window.location.href = "../admin/dashboard.html";
  }
});

/* =========================================================
   HANDLE LOGIN / SIGNUP
========================================================= */

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const endpoint = isLogin
    ? "http://localhost:4000/api/auth/login"
    : "http://localhost:4000/api/auth/register";

  const payload = isLogin
    ? { email, password }
    : { name, email, password, role: "website_admin" };

  try {
    /* ==============================
       START BUTTON LOADING
    ============================== */

    submitBtn.disabled = true;
    btnLoader.classList.remove("hidden");
    btnText.textContent = isLogin ? "Signing in..." : "Creating...";
    errorMsg.textContent = "";

    await new Promise(resolve => setTimeout(resolve, 50));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Authentication failed");
    }

    if (isLogin) {
      localStorage.setItem("adminToken", data.token);

      const overlay = document.getElementById("authLoaderOverlay");
      const card = document.querySelector(".auth-card");

      // 🔥 SHOW FULL PAGE LOADER
      overlay.classList.remove("hidden");
      overlay.classList.add("active");
      card.style.opacity = "0";

      // Wait for animation
      await new Promise(resolve =>
        setTimeout(resolve, LOADER_DURATION)
      );

      window.location.href = "../admin/dashboard.html";

    } else {
      errorMsg.style.color = "green";
      errorMsg.textContent =
        "Account created successfully! Please login.";

      submitBtn.disabled = false;
      btnLoader.classList.add("hidden");
      btnText.textContent = "LOGIN";

      toggleBtn.click();
    }

  } catch (err) {
    errorMsg.style.color = "#c2410c";
    errorMsg.textContent =
      err.message || "Server error. Please try again.";

    submitBtn.disabled = false;
    btnLoader.classList.add("hidden");
    btnText.textContent = isLogin ? "LOGIN" : "SIGN UP";
  }
});