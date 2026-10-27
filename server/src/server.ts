
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/connectDB.js";
import authRouter from "./models/auth/auth.route.js";
import doctorRoute from "./models/doctor/doctor.route.js";
import adminRoute from "./models/admin/admin.route.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/v1/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Backend running successfully",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/doctor", doctorRoute);
app.use("/api/admin", adminRoute);

const PORT = Number(process.env.PORT ?? 8000);

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
