/* =========================================
   GLOBAL API CONFIG
========================================= */

window.API_BASE = window.API_BASE || "http://localhost:4000/api";

/* =========================================
   TIMEOUT HELPER (FIXED 🔥)
========================================= */
function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => clearTimeout(id));
}

/* =========================================
   CORE REQUEST FUNCTION
========================================= */

async function _apiRequest(url, options = {}) {

  const token = sessionStorage.getItem("adminToken");

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  };

  /* 🔐 Attach token */
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  /* 📦 Attach body */
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const fullUrl = `${window.API_BASE}${url}`;

  console.log("📡 API:", {
    url: fullUrl,
    method: config.method
  });

  const response = await fetchWithTimeout(fullUrl, config, 10000);

  /* ==============================
     SESSION EXPIRED
  ============================== */
  if (response.status === 401) {
    console.warn("⚠️ Session expired");

    sessionStorage.clear();
    window.location.href = "/login/index.html";

    throw new Error("Session expired");
  }

  /* ==============================
     PARSE RESPONSE
  ============================== */

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  /* ==============================
     HANDLE ERROR
  ============================== */

  if (!response.ok) {

    const errorMessage =
      data?.message ||
      data?.error ||
      `Request failed (${response.status})`;

    console.error("❌ API Error:", errorMessage);

    throw new Error(errorMessage);
  }

  /* ==============================
     NORMALIZE RESPONSE
  ============================== */

  if (data && typeof data === "object") {

    if ("success" in data) {
      if (!data.success) {
        throw new Error(data.error || "Operation failed");
      }
      return data.data !== undefined ? data.data : data;
    }
  }

  return data;
}

/* =========================================
   RETRY WRAPPER (🔥 IMPORTANT)
========================================= */

async function apiRequest(url, options = {}) {

  let attempts = 2;

  while (attempts--) {
    try {
      return await _apiRequest(url, options);
    } catch (err) {

      if (err.name === "AbortError") {
        console.warn("⏱️ Request timeout");
      }

      if (attempts === 0) {
        console.error("❌ Final API failure:", err.message);
        throw err;
      }

      console.warn("🔁 Retrying API...");
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

/* =========================================
   HELPER METHODS
========================================= */

apiRequest.get = (url) => apiRequest(url);

apiRequest.post = (url, body) =>
  apiRequest(url, { method: "POST", body });

apiRequest.put = (url, body) =>
  apiRequest(url, { method: "PUT", body });

apiRequest.delete = (url) =>
  apiRequest(url, { method: "DELETE" });

/* =========================================
   GLOBAL EXPORT
========================================= */

window.api = apiRequest;