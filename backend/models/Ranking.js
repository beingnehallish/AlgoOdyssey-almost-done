import mongoose from "mongoose";

const rankingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true },
  correctnessScore: { type: Number, default: 0 },   // 0-100
  efficiencyPercentile: { type: Number, default: 0 }, // 0-100, calculated after challenge
  totalScore: { type: Number, default: 0 }, // optional: can combine correctness + efficiency
  rank: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.model("Ranking", rankingSchema);
