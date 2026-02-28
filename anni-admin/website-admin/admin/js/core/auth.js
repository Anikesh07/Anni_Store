const token = localStorage.getItem("adminToken");

if (!token) {
  window.location.href = "../login/index.html";
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  window.location.href = "../login/index.html";
});