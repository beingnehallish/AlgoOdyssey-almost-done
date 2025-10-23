import express from "express";
import Submission from "../models/Submission.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, challengeId, code, language, timeTaken, correctnessScore, efficiencyScore } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid userId" });
    if (!mongoose.Types.ObjectId.isValid(challengeId)) return res.status(400).json({ message: "Invalid challengeId" });

    const newSubmission = new Submission({
      userId,
      challengeId,
      code,
      language,
      timeTaken,
      correctnessScore,
      efficiencyScore
    });

    await newSubmission.save();
    res.status(201).json({ message: "Submission saved successfully", submission: newSubmission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


/**
 * GET /api/submissions/:userId
 * Fetch all submissions of a user
 */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }
  try {
    const submissions = await Submission.find({ userId }).populate("challengeId");
    res.json({ submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
