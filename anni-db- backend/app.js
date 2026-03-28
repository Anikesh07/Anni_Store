const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectMongo = require("./config/db");
const seedSystem = require("./scripts/seedSystem");

/* ===============================
   ROUTES
=============================== */

const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const employeeRoutes = require("./routes/employee.routes");
const leaveRoutes = require("./routes/leave.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const payrollRoutes = require("./routes/payroll.routes");
const companyRoutes = require("./routes/company.routes");
const departmentRoutes = require("./routes/department.routes");
const chatbotRoutes = require("./routes/chatbot.routes");
const intentRoutes = require("./routes/intent.routes");
const trainingRoutes = require("./routes/training.routes");

const app = express();

/* ===============================
   MIDDLEWARE
=============================== */

app.use(cors());
app.use(express.json({ limit: "10mb" })); // 🔥 prevent large payload crash

/* Serve uploaded files */
app.use("/uploads", express.static("uploads"));

/* ===============================
   HEALTH CHECK
=============================== */

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "✅ Anni DB API is running"
  });
});

/* ===============================
   API ROUTES
=============================== */

app.use("/products", productRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/intents", intentRoutes);
app.use("/api/training", trainingRoutes);

/* ===============================
   404 HANDLER
=============================== */

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

/* ===============================
   ERROR HANDLER
=============================== */

app.use((err, req, res, next) => {

  console.error("❌ Server Error:", err.stack || err.message);

  // 🔥 Chatbot-specific error handling
  if (req.originalUrl.includes("/api/chatbot")) {
    return res.status(500).json({
      error: "🤖 Chatbot service is currently unavailable",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });

});

/* ===============================
   START SERVER
=============================== */

const axios = require("axios");

const PORT = process.env.PORT || 4000;

async function checkChatbotHealth() {
  try {
    await axios.get("http://localhost:5005", { timeout: 2000 });
    console.log("🤖 Chatbot (Rasa) is running on port 5005");
  } catch (err) {
    console.log("⚠️ Chatbot (Rasa) is NOT running");
  }
}

async function startServer() {

  try {

    await connectMongo();
    console.log("✅ MongoDB connected");

    await seedSystem();

    const server = app.listen(PORT, async () => {
      console.log(`🚀 Anni DB server running on http://localhost:${PORT}`);

      await checkChatbotHealth();
    });

    /* ===============================
       GRACEFUL SHUTDOWN
    =============================== */

    process.on("SIGINT", () => {
      console.log("🛑 Shutting down server...");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });

  } catch (err) {

    console.error("❌ Server startup failed:", err);
    process.exit(1);

  }

}

startServer();