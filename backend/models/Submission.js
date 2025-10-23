import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  timeTaken: { type: Number, required: true }, // seconds
  efficiencyScore: { type: Number, default: 0 },
  correctnessScore: { type: Number, default: 0 },
  submissionTime: { type: Date, default: Date.now },
});

export default mongoose.model("Submission", submissionSchema);
