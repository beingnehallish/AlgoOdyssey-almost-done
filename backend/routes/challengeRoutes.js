import express from "express";
import Challenge from "../models/Challenge.js";

const router = express.Router();

/**
 * POST /api/challenges
 * body: { title, description, difficulty, timeLimit, startTime, testCases[] }
 */
router.post("/", async (req, res) => {
  try {
    const challenge = new Challenge(req.body);
    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    res.status(400).json({ message: "Failed to create challenge", error: error.message });
  }
});

/**
 * GET /api/challenges
 */
router.get("/", async (_req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch challenges", error: error.message });
  }
});

/**
 * GET /api/challenges/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch challenge", error: error.message });
  }
});

/**
 * PUT /api/challenges/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Challenge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Challenge not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update challenge", error: error.message });
  }
});

/**
 * DELETE /api/challenges/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Challenge.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Challenge not found" });
    res.json({ message: "Challenge deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete challenge", error: error.message });
  }
});

export default router;
