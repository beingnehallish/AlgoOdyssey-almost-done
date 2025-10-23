import Submission from "../models/Submission.js";
import Ranking from "../models/Ranking.js";
import mongoose from "mongoose";

// Call this function after a challenge ends
export const computeLeaderboard = async (challengeId) => {
  try {
    // Fetch all submissions for this challenge
    const submissions = await Submission.find({ challengeId });

    if (!submissions.length) return [];

    // Extract average runtimes
    const runtimes = submissions.map(s => s.avgRuntime || 0).sort((a, b) => a - b);

    // Compute percentile efficiency and totalScore
    const rankings = submissions.map(sub => {
      const index = runtimes.filter(r => r < sub.avgRuntime).length;
const percentile = ((runtimes.length - index) / runtimes.length) * 100;

      const totalScore = (sub.correctnessScore || 0) * 0.7 + percentile * 0.3;

      return {
        userId: sub.userId,
        challengeId: sub.challengeId,
        correctnessScore: sub.correctnessScore || 0,
        avgRuntime: sub.avgRuntime || 0,
        efficiencyPercentile: percentile,
        totalScore
      };
    });

    // Sort by totalScore descending and assign ranks
    rankings.sort((a, b) => b.totalScore - a.totalScore);
    rankings.forEach((r, i) => r.rank = i + 1);

    // Save/update in Ranking collection
    for (const r of rankings) {
      await Ranking.findOneAndUpdate(
        { userId: r.userId, challengeId: r.challengeId },
        r,
        { upsert: true, new: true }
      );
    }

    return rankings;

  } catch (err) {
    console.error("Error computing leaderboard:", err);
    throw err;
  }
};
