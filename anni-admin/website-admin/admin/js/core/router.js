let isSwitching = false;

async function activateSection(id) {
  if (isSwitching) return;

  const current = document.querySelector(".section.active");
  const next = document.getElementById(id);

  if (!next || current === next) return;

  isSwitching = true;

  Loader.start();
  await Transition.fadeOut(current);

  current.classList.remove("active");
  next.classList.add("active");
  next.style.opacity = 0;

  // Call module loader if exists
  const loaderFunction = window[`load${capitalize(id)}Module`];

  if (typeof loaderFunction === "function") {
    await loaderFunction();
  }

  await Transition.fadeIn(next);
  Loader.stop();

  isSwitching = false;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

document.querySelectorAll(".menu-item").forEach(item => {
  item.addEventListener("click", () => {
    activateSection(item.dataset.section);
  });
});