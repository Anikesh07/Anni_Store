/* =========================================
   DASHBOARD CONTROLLER (UI ONLY)
   Auth handled in auth.js
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

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

    // Store last active section in session
    sessionStorage.setItem("activeAdminSection", sectionName);

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

  const savedSection = sessionStorage.getItem("activeAdminSection");
  const initialSection = savedSection || "overview";

  await activateSection(initialSection);

  document.querySelector(".sidebar")?.classList.remove("loading");

});