import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  timeTaken: { type: Number, required: true },       // seconds from challenge start
  executionTime: { type: Number, default: 0 },       // seconds to run code
  memoryUsage: { type: Number, default: 0 },         // MB
  correctnessScore: { type: Number, default: 0 },    // 0-100
  efficiencyScore: { type: Number, default: 0 },     // 0-100, calculated
  totalScore: { type: Number, default: 0 },      // ✅ NEW
  
  submissionTime: { type: Date, default: Date.now },
});

export default mongoose.model("Submission", submissionSchema);
