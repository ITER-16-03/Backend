import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import crop_predictRoutes from "./routes/crop_predictRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";

dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true
}));

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/crop", crop_predictRoutes);
app.use("/api/alerts", alertRoutes);

/* ================= TEST ROUTE ================= */

app.get("/", (req, res) => {
  res.send("API is running...");
});

/* ================= EXPORT ================= */

export default app;