/* =========================================
   DASHBOARD CONTROLLER
   Handles:
   - Section switching
   - Module loading
   - User info
   - Logout
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

  const menuItems = document.querySelectorAll(".menu-item");
  const sidebar = document.querySelector(".sidebar");
  const welcomeText = document.getElementById("welcomeText");

  let isSwitching = false;

  /* =========================================
     USER INFO
  ========================================= */

  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {

    const name = user.name || user.email || "Admin";
    const role = user.role || "ADMIN";

    if (welcomeText) {
      welcomeText.innerText = `Welcome, ${name}`;
    }

    const initials = name
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const userInitials = document.getElementById("userInitials");
    const userName = document.getElementById("userName");
    const userRole = document.getElementById("userRole");

    if (userInitials) userInitials.innerText = initials;
    if (userName) userName.innerText = name;
    if (userRole) userRole.innerText = role;
  }

  /* =========================================
     LOGOUT
  ========================================= */

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login/index.html";
    });
  }

  /* =========================================
     SECTION SWITCHER
  ========================================= */

  async function activateSection(sectionName) {

    if (!sectionName || isSwitching) return;

    const current = document.querySelector(".section.active");
    const next = document.getElementById(sectionName);

    if (!next || current === next) return;

    isSwitching = true;

    sessionStorage.setItem("activeAdminSection", sectionName);

    menuItems.forEach(item =>
      item.classList.remove("active-menu")
    );

    const activeMenu = document.querySelector(
      `.menu-item[data-section="${sectionName}"]`
    );

    if (activeMenu) {
      activeMenu.classList.add("active-menu");
    }

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

      /* =========================================
         LOAD MODULE DYNAMICALLY
      ========================================= */

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

      next.innerHTML = `
        <div class="card">
          Failed to load ${sectionName} module.
        </div>
      `;

    } finally {

      Loader?.stop();
      isSwitching = false;

    }
  }

  /* =========================================
     HELPER
  ========================================= */

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* =========================================
     MENU CLICK HANDLER
  ========================================= */

  menuItems.forEach(item => {

    item.addEventListener("click", () => {

      const section = item.getAttribute("data-section");
      activateSection(section);

    });

  });

  /* =========================================
     DEFAULT SECTION
  ========================================= */

  const savedSection =
    sessionStorage.getItem("activeAdminSection");

  const initialSection = savedSection || "overview";

  await activateSection(initialSection);

  sidebar?.classList.remove("loading");

});