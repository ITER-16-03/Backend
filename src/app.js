import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import crop_predictRoutes from "./routes/crop_predictRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/crop", crop_predictRoutes);

export default app;