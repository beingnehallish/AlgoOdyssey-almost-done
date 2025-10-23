// backend/routes/submissionRoutes.js
import express from "express";
import mongoose from "mongoose";
import Submission from "../models/Submission.js";
import Ranking from "../models/Ranking.js";

const router = express.Router();

/**
 * POST /api/submissions
 * Save a new submission and compute efficiency & totalScore
 */
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      challengeId,
      code,
      language,
      timeTaken,
      executionTime,
      memoryUsage = 0,
      correctnessScore,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid userId" });
    if (!mongoose.Types.ObjectId.isValid(challengeId))
      return res.status(400).json({ message: "Invalid challengeId" });

    // Ensure numeric values
    const timeNum = parseFloat(timeTaken) || 0.001;
    const execNum = parseFloat(executionTime) || 0.001;
    const memNum = parseFloat(memoryUsage) || 1;
    const correctness = parseFloat(correctnessScore) || 0;

    // Compute efficiency score
    // Example formula: smaller time/execution/memory is better
    const efficiencyScore = Math.min(
      100,
      Math.max(0, 0.5 * (1 / timeNum) + 0.3 * (1 / execNum) + 0.2 * (1 / memNum)) * 100
    );

    // Compute totalScore: 70% correctness + 30% efficiency
    const totalScore = 0.7 * correctness + 0.3 * efficiencyScore;

    // Save submission with scores
    const newSubmission = new Submission({
      userId,
      challengeId,
      code,
      language,
      timeTaken: timeNum,
      executionTime: execNum,
      memoryUsage: memNum,
      correctnessScore: correctness,
      efficiencyScore,
      totalScore,
    });

    await newSubmission.save();

    // Optional: update leaderboard for challenge
    await updateLeaderboard(challengeId);

    res.status(201).json({
      message: "Submission saved successfully",
      submission: newSubmission,
    });
  } catch (err) {
    console.error("Error saving submission:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/submissions/user/:userId
 */
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({ message: "Invalid userId" });

  try {
    const submissions = await Submission.find({ userId }).populate("challengeId");
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * Update leaderboard rankings for a challenge
 */
async function updateLeaderboard(challengeId) {
  const submissions = await Submission.find({ challengeId }).populate("userId", "fullName");

  if (!submissions.length) return;

  // Sort by totalScore descending
  const sorted = submissions.sort((a, b) => b.totalScore - a.totalScore);

  // Clear old rankings
  await Ranking.deleteMany({ challengeId });

  // Save new rankings
  let rank = 1;
  for (const s of sorted) {
    await Ranking.create({
      userId: s.userId._id,
      challengeId,
      correctnessScore: s.correctnessScore,
      efficiencyPercentile: s.efficiencyScore,
      totalScore: s.totalScore,
      rank,
    });
    rank++;
  }
}

export default router;
