import mongoose from "mongoose";

const malpracticeLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true },
  detectedAt: { type: Date, default: Date.now },
  flags: [{ type: String }],
});

export default mongoose.model("MalpracticeLog", malpracticeLogSchema);
