import NavbarStudent from "../components/NavbarStudent";
import { useEffect, useState } from "react";
import "../styles/SubmissionsPage.css";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewCode, setViewCode] = useState(null); // store selected submission for modal

  const userId = localStorage.getItem("userId"); // logged-in user

  useEffect(() => {
    if (!userId) return;
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/submissions/${userId}`);
        const data = await res.json();
        setSubmissions(data.submissions || []);
      } catch (err) {
        console.error("Error fetching submissions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [userId]);

  if (!userId) return <p>Please log in to view your submissions.</p>;
  if (loading) return <p>Loading submissions...</p>;

  return (
    <div>
      <NavbarStudent />
      <div className="dashboard-container">
        <h1>Submissions</h1>

        <div className="submissions-page">
          <h2>My Submissions</h2>
          {submissions.length === 0 && <p>No submissions yet.</p>}
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Challenge</th>
                <th>Correctness (%)</th>
                <th>Efficiency (%)</th>
                <th>View Code</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id}>
                  <td>{sub.challengeId?.title || "Challenge Name"}</td>
                  <td>{sub.correctnessScore?.toFixed(2) || 0}</td>
                  <td>{sub.efficiencyScore || 0}</td> {/* 0 until leaderboard computed */}
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => setViewCode(sub)}
                    >
                      View Code
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Modal for code display --- */}
      {viewCode && (
        <div className="modal-overlay" onClick={() => setViewCode(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // prevent closing on inner click
          >
            <h3>{viewCode.challengeId?.title || "Submitted Code"}</h3>
            <p>
              <b>Language:</b> {viewCode.language}
            </p>
            <pre className="code-block">{viewCode.code}</pre>
            <button className="close-btn" onClick={() => setViewCode(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
