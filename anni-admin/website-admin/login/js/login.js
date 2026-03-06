document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("authForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const btnLoader = submitBtn.querySelector(".btn-loader");
  const errorMsg = document.getElementById("errorMsg");

  const passwordGroup = document.getElementById("passwordGroup");
  const otpGroup = document.getElementById("otpGroup");
  const newPasswordGroup = document.getElementById("newPasswordGroup");
  const confirmPasswordGroup = document.getElementById("confirmPasswordGroup");

  const toggleBtn = document.getElementById("toggleBtn");

  const LOADER_DURATION = 2000;
  let activationMode = false;

  if (!form || !submitBtn) return;

  /* ================= SKELETON REVEAL ================= */

  const skeleton = document.getElementById("loginSkeleton");
  const container = document.getElementById("loginContainer");

  setTimeout(() => {

    if (skeleton) skeleton.style.opacity = "0";

    setTimeout(() => {

      if (skeleton) skeleton.style.display = "none";

      if (container) {
        container.classList.remove("hidden");
        container.classList.add("fade-in");
      }

    }, 400);

  }, 800);


  /* ================= AUTO REDIRECT ================= */

  const existingToken = sessionStorage.getItem("adminToken");

  if (existingToken && existingToken.length > 20) {

    const overlay = document.getElementById("authLoaderOverlay");

    if (overlay) {
      overlay.classList.remove("hidden");
      overlay.classList.add("active");
    }

    setTimeout(() => {
      window.location.href = "../admin/dashboard.html";
    }, LOADER_DURATION);

    return;

  }


  /* ================= TOGGLE MODE ================= */

  toggleBtn?.addEventListener("click", () => {

    activationMode = !activationMode;
    errorMsg.textContent = "";

    if (activationMode) {

      passwordGroup.classList.add("hidden");
      otpGroup.classList.add("hidden");
      newPasswordGroup.classList.add("hidden");
      confirmPasswordGroup.classList.add("hidden");

      btnText.textContent = "SEND OTP";
      toggleBtn.textContent = "Back to Login";

    } else {

      passwordGroup.classList.remove("hidden");
      otpGroup.classList.add("hidden");
      newPasswordGroup.classList.add("hidden");
      confirmPasswordGroup.classList.add("hidden");

      btnText.textContent = "LOGIN";
      toggleBtn.textContent = "Activate Account";

    }

  });


  /* ================= FORM SUBMIT ================= */

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const companySlug = document.getElementById("companySlug")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    const otp = document.getElementById("otp")?.value.trim();
    const newPassword = document.getElementById("newPassword")?.value.trim();
    const confirmPassword = document.getElementById("confirmPassword")?.value.trim();

    if (!email) {
      errorMsg.textContent = "Email is required";
      return;
    }

    if (!activationMode && !password) {
      errorMsg.textContent = "Password is required";
      return;
    }

    submitBtn.disabled = true;
    btnLoader.classList.remove("hidden");
    errorMsg.textContent = "";

    try {

      /* ================= LOGIN FLOW ================= */

      if (!activationMode) {

        btnText.textContent = "Logging in...";

        const response = await fetch("http://localhost:4000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companySlug,
            email,
            password
          })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        /* 🔴 IMPORTANT FIX */
        sessionStorage.setItem("adminToken", data.token);
        sessionStorage.setItem("adminLoginTime", Date.now().toString());

        const overlay = document.getElementById("authLoaderOverlay");
        const card = document.querySelector(".auth-card");

        if (overlay && card) {

          overlay.classList.remove("hidden");

          requestAnimationFrame(() => {
            overlay.classList.add("active");
          });

          card.style.transform = "scale(0.95)";
          card.style.opacity = "0";

          await new Promise(resolve =>
            setTimeout(resolve, LOADER_DURATION)
          );
        }

        window.location.href = "../admin/dashboard.html";
        return;

      }


      /* ================= ACTIVATION FLOW ================= */

      if (!otp && !newPassword && !confirmPassword) {

        btnText.textContent = "Sending OTP...";

        const otpRes = await fetch("http://localhost:4000/api/auth/request-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companySlug,
            email
          })
        });

        const otpData = await otpRes.json();

        if (!otpRes.ok) throw new Error(otpData.message);

        errorMsg.style.color = "green";
        errorMsg.textContent = "OTP sent to your email";

        otpGroup.classList.remove("hidden");
        newPasswordGroup.classList.remove("hidden");
        confirmPasswordGroup.classList.remove("hidden");

        otpGroup.classList.add("slide-in");
        newPasswordGroup.classList.add("slide-in");
        confirmPasswordGroup.classList.add("slide-in");

        btnText.textContent = "ACTIVATE ACCOUNT";

        return;

      }

      if (!otp) throw new Error("Please enter OTP");
      if (!newPassword) throw new Error("Please enter new password");
      if (!confirmPassword) throw new Error("Please confirm password");

      if (newPassword !== confirmPassword)
        throw new Error("Passwords do not match");

      btnText.textContent = "Activating...";

      const verifyRes = await fetch("http://localhost:4000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companySlug,
          email,
          otp,
          newPassword
        })
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) throw new Error(verifyData.message);

      errorMsg.style.color = "green";
      errorMsg.textContent = "Account activated. Please login.";

      activationMode = false;

      passwordGroup.classList.remove("hidden");
      otpGroup.classList.add("hidden");
      newPasswordGroup.classList.add("hidden");
      confirmPasswordGroup.classList.add("hidden");

      btnText.textContent = "LOGIN";
      toggleBtn.textContent = "Activate Account";

    } catch (err) {

      errorMsg.style.color = "#c2410c";

      if (
        err.message === "Invalid credentials" ||
        err.message === "User not found"
      ) {
        errorMsg.textContent = "Wrong email or password";
      } else {
        errorMsg.textContent = err.message || "Something went wrong";
      }

    } finally {

      submitBtn.disabled = false;
      btnLoader.classList.add("hidden");

      if (!activationMode)
        btnText.textContent = "LOGIN";

    }

  });


  /* ================= SHOW / HIDE PASSWORD ================= */

  const toggleIcons = document.querySelectorAll(".toggle-password");

  toggleIcons.forEach(icon => {

    icon.addEventListener("click", () => {

      const targetId = icon.getAttribute("data-target");
      const input = document.getElementById(targetId);

      if (!input) return;

      if (input.type === "password") {

        input.type = "text";
        icon.textContent = "🙈";

      } else {

        input.type = "password";
        icon.textContent = "👁";

      }

    });

  });

});