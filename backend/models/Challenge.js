import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true }
  },
  { _id: false }
);

const challengeSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, required: true },
    difficulty:  { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
    timeLimit:   { type: Number, default: 1 }, // seconds
    startTime:   { type: Date, default: null },
   testCases:   { type: [testCaseSchema], default: [] },
    leaderboardComputed: { type: Boolean, default: false },
    starterCode: { 
      type: Map, 
      of: String,
      default: {
        "JavaScript": "// Write JS code here",
        "Python": "// Write Python code here",
        "C": "// Write C code here",
        "C++": "// Write C++ code here",
        "Java": "// Write Java code here",
        "Go": "// Write Go code here",
        "Rust": "// Write Rust code here",
        "PHP": "// Write PHP code here"
      }
    }
  },
  { timestamps: true }
);


export default mongoose.model("Challenge", challengeSchema);
