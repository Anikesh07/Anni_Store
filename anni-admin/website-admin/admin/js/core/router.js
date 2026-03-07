/* =========================================
   ADMIN ROUTER SYSTEM
========================================= */

let isSwitching = false;


/* =========================================
   ACTIVATE SECTION
========================================= */

async function activateSection(id) {

  if (isSwitching) return;

  const current = document.querySelector(".section.active");
  const next = document.getElementById(id);

  if (!next || current === next) return;

  isSwitching = true;

  try {

    Loader.start();

    /* Fade out current section */
    if (current) {
      await Transition.fadeOut(current);
      current.classList.remove("active");
    }

    /* Activate new section */
    next.classList.add("active");
    next.style.opacity = 0;

    updateMenuState(id);

    /* ============================
       MODULE LOADER
    ============================ */

    const loaderFunction = window[`load${capitalize(id)}Module`];

    if (typeof loaderFunction === "function") {
      await loaderFunction();
    }

    /* Fade in new section */
    await Transition.fadeIn(next);

  } catch (error) {

    console.error("Router error:", error);

  } finally {

    Loader.stop();
    isSwitching = false;

  }

}


/* =========================================
   UPDATE MENU STATE
========================================= */

function updateMenuState(id) {

  document.querySelectorAll(".menu-item").forEach(item => {
    item.classList.remove("active");

    if (item.dataset.section === id) {
      item.classList.add("active");
    }
  });

}


/* =========================================
   STRING CAPITALIZE
========================================= */

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


/* =========================================
   MENU CLICK HANDLER
========================================= */

document.querySelectorAll(".menu-item").forEach(item => {

  item.addEventListener("click", () => {

    const sectionId = item.dataset.section;

    activateSection(sectionId);

  });

});


/* =========================================
   AUTO LOAD FIRST MODULE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const firstSection = document.querySelector(".section.active");

  if (!firstSection) return;

  const id = firstSection.id;

  const loaderFunction = window[`load${capitalize(id)}Module`];

  if (typeof loaderFunction === "function") {
    loaderFunction();
  }

});



