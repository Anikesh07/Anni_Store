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

const app = express();

/* ===============================
   MIDDLEWARE
=============================== */

app.use(cors());
app.use(express.json());

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

/* ===============================
   404 HANDLER
=============================== */

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

/* ===============================
   ERROR HANDLER
=============================== */

app.use((err, req, res, next) => {

  console.error("❌ Server Error:", err.message);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });

});

/* ===============================
   START SERVER
=============================== */

const PORT = process.env.PORT || 4000;

async function startServer() {

  try {

    await connectMongo();
    console.log("✅ MongoDB connected");

    /* Run seed system */
    await seedSystem();

    app.listen(PORT, () => {
      console.log(`🚀 Anni DB server running on http://localhost:${PORT}`);
    });

  } catch (err) {

    console.error("❌ Server startup failed:", err);
    process.exit(1);

  }

}

startServer();