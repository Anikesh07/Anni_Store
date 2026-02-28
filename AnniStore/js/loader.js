/* ================= GLOBAL TOP LOADER ================= */

const topLoader = document.getElementById("topLoader");
const netError = document.getElementById("netError");

function startLoader() {
  if (!topLoader) return;
  topLoader.style.opacity = "1";
  topLoader.style.width = "20%";
}

function progressLoader(p) {
  if (!topLoader) return;
  topLoader.style.width = p + "%";
}

function endLoader() {
  if (!topLoader) return;
  topLoader.style.width = "100%";

  setTimeout(() => {
    topLoader.style.opacity = "0";
    topLoader.style.width = "0%";
  }, 300);
}

function showNetError() {
  if (!netError) return;
  netError.classList.remove("hidden");
}

/* expose globally */
window.startLoader = startLoader;
window.progressLoader = progressLoader;
window.endLoader = endLoader;
window.showNetError = showNetError;

/* SAFETY NETS (IMPORTANT) */
window.addEventListener("error", () => {
  endLoader();
  showNetError();
});

window.addEventListener("unhandledrejection", () => {
  endLoader();
  showNetError();
});

/* auto start */
startLoader();
