import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import crop_predictRoutes from "./routes/crop_predictRoutes.js";
import diseaseRoutes from "./routes/diseaseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import yieldRoutes from "./routes/yieldRoutes.js";

const app = express();

/* ================= CORS ================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://demo2-three-topaz.vercel.app",
  "https://agro-ai-dusky.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options(/.*/, cors());

/* ================= MIDDLEWARE ================= */

app.use(express.json());
app.use(cookieParser());

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/crop", crop_predictRoutes);
app.use("/api/disease", diseaseRoutes);
app.use("/api/user", userRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/yield", yieldRoutes);

export default app;