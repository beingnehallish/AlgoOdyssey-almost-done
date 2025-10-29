import NavbarStudent from "../components/NavbarStudent";
import { useEffect, useState } from "react";
import "../styles/StudentDashboard.css";
import { FaQuestionCircle } from "react-icons/fa";

export default function StudentDashboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");
const [showHelp, setShowHelp] = useState(false);

useEffect(() => {
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/leaderboard/latest"); 
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const data = await res.json();
      setLeaderboard(data.leaderboard || []); // <-- use data.leaderboard
    } catch (err) {
      console.error(err);
      setError("Unable to load leaderboard.");
    } finally {
      setLoading(false);
    }
  };

  fetchLeaderboard();
}, []);


  return (
    <div className="dashboard-wrapper">
      <NavbarStudent />
      <div className="dashboard-container">
        <div className="dashboard-header">
  <h1>Student Dashboard</h1>
  <FaQuestionCircle
    className="help-icon"
    title="What is Efficiency Percentile?"
    onClick={() => setShowHelp(true)}
  />
</div><p className="welcome-text">Track your performance and rankings below.</p>

        {loading && <p className="loading-text">Loading leaderboard...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && leaderboard.length === 0 && (
          <p className="no-data">No rankings available yet.</p>
        )}

        {!loading && leaderboard.length > 0 && (
          <div className="leaderboard-container">
            <h2 className="leaderboard-title">Leaderboard</h2>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Correctness (%)</th>
                  <th>Efficiency Percentile</th>
                  <th>Total Score</th>
                </tr>
              </thead>
              <tbody>
  {leaderboard.map((student) => (
    <tr
      key={student.userId}
      className={student.userId === userId ? "highlight-row" : ""}
    >
      <td>#{student.rank}</td>
      <td>{student.userName}</td>
      <td>{(student.correctnessScore ?? 0).toFixed(2)}</td>
      <td>{(student.efficiencyPercentile ?? 0).toFixed(2)}</td>
      <td>{(student.totalScore ?? 0).toFixed(2)}</td>
    </tr>
  ))}
</tbody>

            </table>
          </div>
        )}
      </div>
      
{showHelp && (
  <div className="help-modal-overlay" onClick={() => setShowHelp(false)}>
    <div className="help-modal" onClick={(e) => e.stopPropagation()}>
      <h2>What is Efficiency Percentile?</h2>
      <div className="help-content">
        <p>
          The <strong>Efficiency Percentile</strong> in your leaderboard context measures how
          optimized and performant a user’s submitted code is, relative to others who solved the
          same challenge.
        </p>

        <h3>⚙️ 1. Efficiency Percentile = Performance comparison among all submissions</h3>
        <p>
          It’s a <strong>relative score</strong>, not an absolute one — meaning:
          <br />• If your code runs faster (less execution time, less memory), you’ll rank higher.
          <br />• It’s expressed as a percentile (0–100) showing how your code compares to others.
        </p>

        <h3>🧮 2. Typical Formula (used in your setup)</h3>
        <pre className="formula">
{`Efficiency Percentile = 100 × (1 - executionTime_of_user / max_executionTime_among_all)
`}
        </pre>

        <p>
          Example:
          <br />• You run faster than 90% of users → efficiencyPercentile ≈ 90
          <br />• You run slowest → efficiencyPercentile = 0
        </p>

        <button className="close-btn" onClick={() => setShowHelp(false)}>Close</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
