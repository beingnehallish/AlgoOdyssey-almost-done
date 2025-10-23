import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import runRoute from "./routes/runRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import submissionRoute from "./routes/submissionRoute.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import Challenge from "./models/Challenge.js";
dotenv.config();

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
app.use("/api/challenges", challengeRoutes); // CRUD for challenges
app.use("/api/run", runRoute);
app.use("/api/submissions", submissionRoute);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api", authRoutes);            // /api/register, /api/login, /api/profile/:email

// Runs every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    // Find challenges where startTime + timeLimit <= now and leaderboard not computed
    const challenges = await Challenge.find({
      leaderboardComputed: { $ne: true },
      $expr: {
        $lte: [
          { $add: ["$startTime", { $multiply: ["$timeLimit", 1000] }] }, 
          now
        ]
      }
    });

    for (const challenge of challenges) {
      console.log(`Computing leaderboard for challenge: ${challenge._id}`);
      await computeLeaderboard(challenge._id);

      // Mark leaderboard as computed
      challenge.leaderboardComputed = true;
      await challenge.save();
    }

  } catch (err) {
    console.error("Error in scheduled leaderboard computation:", err);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
});
