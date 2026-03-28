/* =========================================
   GLOBAL API CONFIG
========================================= */

window.API_BASE = "http://localhost:4000/api";


/* =========================================
   GLOBAL API REQUEST HELPER
========================================= */

async function apiRequest(url, options = {}) {

  const token = sessionStorage.getItem("adminToken");

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  };

  /* 🔥 Attach token automatically */
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("⚠️ No auth token found in sessionStorage");
  }

  /* Attach request body */
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  console.log("📡 API Request:", {
    url: `${window.API_BASE}${url}`,
    method: config.method,
    hasToken: !!token
  });

  try {

    const response = await fetch(`${window.API_BASE}${url}`, config);

    /* ==============================
       SESSION EXPIRED
    ============================== */

    if (response.status === 401) {

      console.warn("⚠️ Session expired");

      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminLoginTime");

      window.location.href = "/login/index.html";
      return;
    }

    /* ==============================
       PARSE RESPONSE
    ============================== */

    let data;

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    /* ==============================
       HANDLE API ERROR
    ============================== */

    if (!response.ok) {

      console.error("❌ API Response Error:", data);

      const errorMessage =
        data.message ||
        data.error ||
        "API request failed";

      throw new Error(errorMessage);
    }

    return data;

  } catch (error) {

    console.error("❌ API Error:", error.message);

    throw error;
  }
}


/* =========================================
   HELPER METHODS
========================================= */

apiRequest.get = (url) => {
  return apiRequest(url, { method: "GET" });
};

apiRequest.post = (url, body) => {
  return apiRequest(url, {
    method: "POST",
    body
  });
};

apiRequest.put = (url, body) => {
  return apiRequest(url, {
    method: "PUT",
    body
  });
};

apiRequest.delete = (url) => {
  return apiRequest(url, {
    method: "DELETE"
  });
};


/* =========================================
   GLOBAL EXPORT
========================================= */

window.api = apiRequest;