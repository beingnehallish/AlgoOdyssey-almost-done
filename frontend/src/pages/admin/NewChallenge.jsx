import { useState } from "react";
import "../../styles/NewChallenge.css"; // make sure the path is correct
//import Challenge from "../../models/Challenge"; // if you plan to directly import model (or use API)

export default function NewChallenge() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [timeLimit, setTimeLimit] = useState(1); // in seconds
  const [testCases, setTestCases] = useState([{ input: "", expectedOutput: "" }]);
  const [startTime, setStartTime] = useState("");
  const [message, setMessage] = useState("");

  // Add a new empty test case
  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "" }]);
  };

  // Remove test case at index
  const removeTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  // Update test case input/output
  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  // Submit the new challenge
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation: at least one test case
   if (testCases.length === 0) {
      setMessage("Add at least one test case!");
      return;
    }

    try {
      const body = { title, description, difficulty, timeLimit, startTime, testCases }; // <-- include startTime

      const res = await fetch("http://localhost:5000/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Challenge created successfully!");
        setTitle("");
        setDescription("");
        setDifficulty("Easy");
        setTimeLimit(1);
        setStartTime(""); // <-- reset
        setTestCases([{ input: "", expectedOutput: "" }]);
      } else {
        setMessage(data.message || "Failed to create challenge");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <div className="new-challenge-container">
      <h2>Create New Challenge</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Challenge Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Challenge Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="5"
          required
        />
        
        {/* Start Time Input */}
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />

        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <input
          type="number"
          placeholder="Time Limit (seconds)"
          value={timeLimit}
          onChange={(e) => setTimeLimit(Number(e.target.value))}
          min="1"
          required
        />

        <h3>Test Cases</h3>
        {testCases.map((tc, index) => (
          <div className="test-case" key={index}>
            <input
              type="text"
              placeholder="Input"
              value={tc.input}
              onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Expected Output"
              value={tc.expectedOutput}
              onChange={(e) => handleTestCaseChange(index, "expectedOutput", e.target.value)}
              required
            />
            {testCases.length > 1 && (
              <button type="button" onClick={() => removeTestCase(index)}>❌</button>
            )}
          </div>
        ))}

        <button type="button" className="add-test-case-btn" onClick={addTestCase}>
          ➕ Add Test Case
        </button>
<button
  type="submit"
  disabled={testCases.length < 10}
  style={{
    opacity: testCases.length < 10 ? 0.5 : 1,
    cursor: testCases.length < 10 ? "not-allowed" : "pointer"
  }}
>
  Create Challenge
</button>
{testCases.length < 10 && (
  <p className="warning-text">⚠️ Add at least 10 test cases before creating the challenge!</p>
)}
</form>
    </div>
  );
}