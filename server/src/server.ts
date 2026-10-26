import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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

app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend running successfully",
  });
});

const PORT = process.env.PORT ?? 8000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});