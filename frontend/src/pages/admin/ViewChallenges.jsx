import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import "../../styles/ViewChallenges.css";

export default function ViewChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState([]);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    difficulty: "",
    timeLimit: 1,
    startTime: "",
    testCases: [],
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/challenges");
      const data = await res.json();
      setChallenges(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch challenges:", err);
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleEdit = (challenge) => {
    setEditingChallenge(challenge._id);
    setEditData({
      title: challenge.title || "",
      description: challenge.description || "",
      difficulty: challenge.difficulty || "",
      timeLimit: challenge.timeLimit || 1,
      startTime: challenge.startTime
        ? new Date(challenge.startTime).toISOString().slice(0, 16)
        : "",
      testCases: challenge.testCases || [],
    });
  };

  const handleEditSave = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/challenges/${editingChallenge}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        fetchChallenges();
        setEditingChallenge(null);
      } else {
        console.error("Failed to update challenge");
      }
    } catch (err) {
      console.error("Error updating challenge:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this challenge?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/challenges/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setChallenges((prev) => prev.filter((c) => c._id !== id));
        } else {
          console.error("Failed to delete challenge");
        }
      } catch (err) {
        console.error("Error deleting challenge:", err);
      }
    }
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...editData.testCases];
    updated[index][field] = value;
    setEditData({ ...editData, testCases: updated });
  };

  const addTestCase = () => {
    setEditData({
      ...editData,
      testCases: [...editData.testCases, { input: "", output: "" }],
    });
  };

  const removeTestCase = (index) => {
    const updated = editData.testCases.filter((_, i) => i !== index);
    setEditData({ ...editData, testCases: updated });
  };

  const difficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "green";
      case "medium":
        return "orange";
      case "hard":
        return "red";
      default:
        return "gray";
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading challenges...</p>;
  if (challenges.length === 0) return <p style={{ textAlign: "center" }}>No challenges found.</p>;

  return (
    <div className="view-challenges-container">
      <h2>All Challenges</h2>

      {challenges.map((challenge) => (
        <div key={challenge._id} className="challenge-card1">
          <div className="challenge-header" onClick={() => toggleExpand(challenge._id)}>
  <h3 className="challenge-title">{challenge.title}</h3>
  <div className="challenge-right">
    <span
      className="difficulty-label"
      style={{ backgroundColor: difficultyColor(challenge.difficulty) }}
    >
      {challenge.difficulty || "N/A"}
    </span>
    <span className="arrow">{expandedIds.includes(challenge._id) ? "▲" : "▼"}</span>
  </div>
</div>


          <div className="challenge-starttime">
            {challenge.startTime && (
              <p>
                <strong>Start Time:</strong>{" "}
                {new Date(challenge.startTime).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          {expandedIds.includes(challenge._id) && (
            <div className="challenge-details1">
              {challenge.description && (
                <p><strong>Description:</strong> {challenge.description}</p>
              )}
              {challenge.timeLimit && (
                <p><strong>Time Limit:</strong> {challenge.timeLimit}s</p>
              )}
              {challenge.testCases?.length > 0 && (
                <div>
                  <strong>Test Cases:</strong>
                  <ul>
                    {challenge.testCases.map((tc, i) => (
                      <li key={i}>
                        <strong>Input:</strong> {tc.input} | <strong>Output:</strong> {tc.output}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="challenge-actions">
                <button className="edit-btn" onClick={() => handleEdit(challenge)}>
                  <FaEdit /> Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(challenge._id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* ✅ EDIT MODAL */}
      {editingChallenge && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Challenge</h3>

            <input
              type="text"
              placeholder="Title"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            />

            <textarea
              placeholder="Description"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows="4"
            />

            <select
              value={editData.difficulty}
              onChange={(e) => setEditData({ ...editData, difficulty: e.target.value })}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <input
              type="number"
              placeholder="Time Limit (seconds)"
              value={editData.timeLimit}
              onChange={(e) => setEditData({ ...editData, timeLimit: Number(e.target.value) })}
            />

            {/* ✅ Start Time */}
            <label><strong>Start Date & Time:</strong></label>
            <input
              type="datetime-local"
              value={editData.startTime}
              onChange={(e) => setEditData({ ...editData, startTime: e.target.value })}
            />

            {/* ✅ Test Cases */}
            <div className="test-cases-section">
              <h4>Test Cases</h4>
              {editData.testCases.map((tc, index) => (
                <div key={index} className="testcase-item">
                  <input
                    type="text"
                    placeholder="Input"
                    value={tc.input}
                    onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Expected Output"
                    value={tc.output}
                    onChange={(e) => handleTestCaseChange(index, "output", e.target.value)}
                  />
                  <button onClick={() => removeTestCase(index)} className="delete-btn small">
                    <FaMinus />
                  </button>
                </div>
              ))}
              <button onClick={addTestCase} className="edit-btn small">
                <FaPlus /> Add Test Case
              </button>
            </div>

            <div className="modal-buttons">
              <button onClick={handleEditSave} className="edit-btn">Save</button>
              <button onClick={() => setEditingChallenge(null)} className="delete-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
