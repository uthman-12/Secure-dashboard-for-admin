const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Route imports
const authRoutes = require("./routes/authRoutes");     // User login/signup
const adminAuthRoutes = require("./routes/auth");      // Admin OTP + register
const userRoutes = require("./routes/users");          // Manage users
const dashboardRoutes = require("./routes/dashboard"); // Dashboard stats

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ DB Connection error:", err));

// Routes
app.use("/api/auth", authRoutes);         // /signup, /login
app.use("/api/admin", adminAuthRoutes);   // /send-otp, /verify-otp, /register
app.use("/api/users", userRoutes);        // protected user routes
app.use("/api/dashboard", dashboardRoutes); // protected dashboard routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app.use(cors({
  origin: "http://127.0.0.1:5500", // 👈 matches Live Server
  credentials: true
}));
