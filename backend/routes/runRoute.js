import express from "express";
import axios from "axios";

const router = express.Router();

const JUDGE0_API = "https://ce.judge0.com/submissions";

const languageMap = {
  JavaScript: 63, // Node.js 18.x
  Python: 71,     // Python 3.11
  C: 50,
  "C++": 54,
  Java: 62,
  Go: 95,
  Rust: 73,
  PHP: 68,
};

router.post("/", async (req, res) => {
  const { code, language, testCases } = req.body;

  if (!code || !language || !testCases) {
    return res.status(400).json({ message: "Missing code, language, or testCases" });
  }

  const language_id = languageMap[language];
  if (!language_id) {
    return res.status(400).json({ message: "Unsupported language" });
  }

  const results = [];

  try {
    for (const test of testCases) {
  const input = test.input;
  const expectedOutput = test.expectedOutput?.trim() || "";

  const response = await axios.post(
    `${JUDGE0_API}?base64_encoded=false&wait=true`,
    {
      source_code: code,
      language_id,
      stdin: input,
    },
    { headers: { "Content-Type": "application/json" } }
  );

  const result = response.data;
const output = (result.stdout || result.stderr || result.compile_output || "").trim();
const compileTime = result.compile_time || 0;
const runtime = result.time || 0; 

  results.push({
    input,
  expected: expectedOutput,
  got: output,
  passed: output === expectedOutput,
  compileTime,
  runtime,
  });
}

    res.json({ results });
  } catch (err) {
    console.error("Judge0 Error:", err.message);
    res.status(500).json({ message: "Error communicating with Judge0 API" });
  }
});

export default router;

