/* =========================================
   DASHBOARD CONTROLLER
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

  const menuItems = document.querySelectorAll(".menu-item");
  const sidebar = document.querySelector(".sidebar");
  const welcomeText = document.getElementById("welcomeText");

  let isSwitching = false;

  /* =========================================
     USER INFO
  ========================================= */

  let user = null;

try {

  const token = sessionStorage.getItem("adminToken");
  const payload = JSON.parse(atob(token.split('.')[1]));

  console.log("TOKEN PAYLOAD:", payload);

  /* ================= SUPER ADMIN ================= */

  if (!payload.employeeId) {

    user = {
      name: "Admin",
      email: "",
      role: payload.role || "SUPER_ADMIN"
    };

  } else {

    /* ================= NORMAL USER ================= */

    const emp = await api.get("/employee/me");

    console.log("EMPLOYEE DATA:", emp);

    user = {
      name: emp.personal?.name || "User",
      email: emp.personal?.email || "",
      role: emp.user?.role || "EMPLOYEE"
    };

  }

} catch (err) {
  console.error("Failed to fetch user:", err);
}

  /* =========================================
     APPLY USER DATA TO UI
  ========================================= */

  if (user) {

    const name = user.name || user.email || "Admin";
    const role = user.role || "User";

    if (welcomeText) {
      welcomeText.innerText = `Welcome, ${name}`;
    }

    const initials = name
      .split(" ")
      .map(n => n.charAt(0))
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

      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminLoginTime");
      sessionStorage.removeItem("activeAdminSection");
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

      if (window.Panel) {
        Panel.close();
      }

      if (current) {

        if (typeof Transition !== "undefined") {
          await Transition.fadeOut(current);
        }

        current.classList.remove("active");
      }

      next.classList.add("active");
      next.style.opacity = 0;

      window.scrollTo(0, 0);

      const loaderFunction =
        window[`load${capitalize(sectionName)}Module`] || null;

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

      if (section) activateSection(section);

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