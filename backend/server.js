import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env at the very top
dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("MongoDB URI:", process.env.MONGODB_URI);

import express from "express";
import cors from "cors";
import cron from "node-cron";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import runRoute from "./routes/runRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import submissionRoute from "./routes/submissionRoute.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import Challenge from "./models/Challenge.js";
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/", (_req, res) => {
  res.send("Algo Odyssey API is running");
});

// Routes
app.use("/api/challenges", challengeRoutes);
app.use("/api/run", runRoute);
app.use("/api/submissions", submissionRoute);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api", authRoutes);


// Runs every minute: compute leaderboard
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const challenges = await Challenge.find({
      leaderboardComputed: { $ne: true },
      $expr: {
        $lte: [
          { $add: ["$startTime", { $multiply: ["$timeLimit", 1000] }] },
          now,
        ],
      },
    });

    for (const challenge of challenges) {
      console.log(`Computing leaderboard for challenge: ${challenge._id}`);
      await computeLeaderboard(challenge._id);
      challenge.leaderboardComputed = true;
      await challenge.save();
    }
  } catch (err) {
    console.error("Error in scheduled leaderboard computation:", err);
  }
});


const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
});

