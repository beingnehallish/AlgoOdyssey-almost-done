import NavbarStudent from "../components/NavbarStudent";
import { useEffect, useState } from "react";
import "../styles/StudentDashboard.css";

export default function StudentDashboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/leaderboard/latest"); 
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();
        setLeaderboard(data);
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
        <h1 className="dashboard-title">🏆 Student Dashboard</h1>
        <p className="welcome-text">Track your performance and rankings below.</p>

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
                    className={
                      student.userId === userId ? "highlight-row" : ""
                    }
                  >
                    <td>#{student.rank}</td>
                    <td>{student.userName}</td>
                    <td>{student.correctnessScore.toFixed(2)}</td>
                    <td>{student.efficiencyPercentile.toFixed(2)}</td>
                    <td>{student.totalScore.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
