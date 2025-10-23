import express from "express";
import Ranking from "../models/Ranking.js";

const router = express.Router();

/**
 * 1️⃣ Get latest leaderboard
 *    GET /api/leaderboard/latest
 */
router.get("/latest", async (req, res) => {
  try {
    const latest = await Ranking.findOne().sort({ lastUpdated: -1 });

    if (!latest) {
      return res.status(404).json({ message: "No leaderboard data available yet." });
    }

    const leaderboard = await Ranking.find({ challengeId: latest.challengeId })
      .populate("userId", "name email")
      .sort({ rank: 1 });

    const formatted = leaderboard.map((r) => ({
      userId: r.userId?._id,
      userName: r.userId?.name || "Anonymous",
      correctnessScore: r.correctnessScore?.toFixed(2) || 0,
      efficiencyPercentile: r.efficiencyPercentile?.toFixed(2) || 0,
      totalScore: r.totalScore?.toFixed(2) || 0,
      rank: r.rank,
    }));

    res.json({
      challengeId: latest.challengeId,
      totalParticipants: formatted.length,
      leaderboard: formatted,
    });
  } catch (err) {
    console.error("Error fetching latest leaderboard:", err);
    res.status(500).json({ message: "Failed to fetch latest leaderboard" });
  }
});

/**
 * 2️⃣ Get leaderboard by challenge ID
 *    GET /api/leaderboard/:challengeId
 */
router.get("/:challengeId", async (req, res) => {
  try {
    const { challengeId } = req.params;

    const leaderboard = await Ranking.find({ challengeId })
      .populate("userId", "name email")
      .sort({ rank: 1 });

    if (!leaderboard.length) {
      return res.status(404).json({ message: "No rankings found for this challenge." });
    }

    const formatted = leaderboard.map((r) => ({
      userId: r.userId?._id,
      userName: r.userId?.name || "Anonymous",
      correctnessScore: r.correctnessScore?.toFixed(2) || 0,
      efficiencyPercentile: r.efficiencyPercentile?.toFixed(2) || 0,
      totalScore: r.totalScore?.toFixed(2) || 0,
      rank: r.rank,
    }));

    res.json({
      challengeId,
      totalParticipants: formatted.length,
      leaderboard: formatted,
    });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

export default router;
