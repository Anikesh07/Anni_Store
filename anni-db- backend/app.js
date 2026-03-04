const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectMongo = require("./config/db");

const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const employeeRoutes = require("./routes/employee.routes");
const leaveRoutes = require("./routes/leave.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const payrollRoutes = require("./routes/payroll.routes");
const companyRoutes = require("./routes/company.routes");
const payrollRoutes = require("./routes/payroll.routes");


const app = express();

/* -----------------------
   MIDDLEWARE
------------------------ */
app.use(cors());
app.use(express.json()); // MUST come before routes

/* Serve uploaded images */
app.use("/uploads", express.static("uploads"));

/* -----------------------
   DATABASE
------------------------ */
connectMongo();

/* -----------------------
   HEALTH CHECK
------------------------ */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "✅ Anni DB API is running"
  });
});

/* -----------------------
   ROUTES
------------------------ */
app.use("/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/payroll", payrollRoutes);

/* -----------------------
   ERROR HANDLER
------------------------ */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({
    error: err.message || "Internal Server Error"
  });
});

/* -----------------------
   SERVER
------------------------ */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Anni DB server running on http://localhost:${PORT}`);
});