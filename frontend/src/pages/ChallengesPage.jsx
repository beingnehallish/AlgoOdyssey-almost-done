import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavbarStudent from "../components/NavbarStudent";
import "../styles/ChallengesPage.css";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [agreeTC, setAgreeTC] = useState(false);
  const [step, setStep] = useState(1);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChallenges();
    const interval = setInterval(() => {
      setChallenges((prev) => [...prev]);
    }, 1000);
    return () => clearInterval(interval);
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

  const getTimeLeft = (startTime, timeLimitSeconds) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(start.getTime() + timeLimitSeconds * 1000); // seconds → ms

    if (now < start) return { status: "upcoming", diff: start - now, total: start - now };
    if (now >= start && now <= end) return { status: "active", diff: end - now, total: end - start };
    return { status: "ended", diff: 0, total: 0 };
  };

  const formatMMSS = (ms) => {
    ms = Math.max(ms, 0);
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
  };

  const handleStart = (challenge) => {
    setCurrentChallenge(challenge);
    setModalOpen(true);
    setStep(1);
    setAgreeTC(false);
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
      startWebcam();
    } else if (step === 2) {
      await captureAndVerify();
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => resolve(true);
        });
      }
    } catch (err) {
      alert("Cannot access webcam. " + err.message);
    }
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return alert("Webcam not ready yet.");

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const email = localStorage.getItem("email");
    if (!email) return alert("Email not found. Please login again.");

    try {
      setVerifying(true);
      const res = await fetch(
        `http://localhost:5000/api/verify-identity/${currentChallenge._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, image: canvas.toDataURL("image/jpeg") }),
        }
      );
      const data = await res.json();
      setVerifying(false);

      if (data.verified) {
        setIdentityVerified(true);
        stopWebcam();
        setModalOpen(false);
        navigate(`/challenge/${currentChallenge._id}`);
      } else {
        alert(`❌ Identity verification failed. Distance: ${data.distance?.toFixed(2) || "N/A"}`);
      }
    } catch (err) {
      setVerifying(false);
      console.error(err);
      alert("⚠️ Server error during identity verification.");
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
  };

  const handleCloseModal = () => {
    stopWebcam();
    setModalOpen(false);
  };

  if (loading) return (
    <div className="challenges-page">
      <NavbarStudent />
      <p>Loading challenges...</p>
    </div>
  );

  // Only show next upcoming or active challenge
  const nextChallenge = challenges.find(
    (c) => getTimeLeft(c.startTime, c.timeLimit).status !== "ended"
  );

  const { status, diff, total } = nextChallenge
    ? getTimeLeft(nextChallenge.startTime, nextChallenge.timeLimit)
    : { status: "ended", diff: 0, total: 0 };
  const progress = total ? ((total - diff) / total) * 100 : 100;

  return (
    <div className="challenges-page">
      <NavbarStudent />
      <div className="challenges-container">
        {!nextChallenge ? (
          <p className="no-challenges">No upcoming challenges at the moment.</p>
        ) : (
          <div className="challenge-list">
            <div className="challenge-card">
              <div className="progress-ring-container">
                <svg className="progress-ring" width="160" height="160">
                  <circle className="ring-bg" r="70" cx="80" cy="80" />
                  <circle
                    className={`ring-fill ${status}`}
                    r="70"
                    cx="80"
                    cy="80"
                    strokeDasharray={2 * Math.PI * 70}
                    strokeDashoffset={((100 - progress) / 100) * 2 * Math.PI * 70}
                  />
                </svg>
                <div className="time-text-center">{status === "ended" ? "00:00" : formatMMSS(diff)}</div>
              </div>

              <button
                className={`start-btn ${status === "upcoming" || status === "ended" ? "disabled" : ""}`}
                disabled={status === "upcoming" || status === "ended"}
                onClick={() => handleStart(nextChallenge)}
              >
                {status === "ended" ? "Challenge Ended" : "Start Challenge"}
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            {step === 1 && (
              <>
                <h2>Terms & Conditions</h2>
                <div className="tc-container">
                  <ul>
                    <li>No malpractice. Cheating leads to disqualification.</li>
                    <li>Complete within the given time frame.</li>
                    <li>Follow challenge instructions.</li>
                  </ul>
                </div>
                <div>
                  <input type="checkbox" id="agreeTC" checked={agreeTC} onChange={(e) => setAgreeTC(e.target.checked)} />
                  <label htmlFor="agreeTC"> I agree to all Terms & Conditions</label>
                </div>
                <button className="btn" onClick={handleNext} disabled={!agreeTC}>Next</button>
              </>
            )}

            {step === 2 && (
              <>
                <h2>Identity Verification</h2>
                <video ref={videoRef} autoPlay width="320" height="240" />
                <button className="btn" onClick={handleNext} disabled={verifying}>
                  {verifying ? "Verifying..." : "Capture & Verify"}
                </button>
              </>
            )}

            <button className="modal-close" onClick={handleCloseModal}>❌ Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

/*import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavbarStudent from "../components/NavbarStudent";
import "../styles/ViewChallenges.css";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [agreeTC, setAgreeTC] = useState(false);
  const [step, setStep] = useState(1); // 1 = T&C, 2 = Webcam
  const [identityVerified, setIdentityVerified] = useState(false);
  const [verifying, setVerifying] = useState(false); // ✅ Loading spinner state
  const videoRef = useRef(null);
  const navigate = useNavigate();

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

  const handleStart = (challenge) => {
    setCurrentChallenge(challenge);
    setModalOpen(true);
    setStep(1);
    setAgreeTC(false);
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
      startWebcam();
    } else if (step === 2) {
      await captureAndVerify();
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => resolve(true);
        });
      }
    } catch (err) {
      alert("Cannot access webcam. " + err.message);
    }
  };

  const captureAndVerify = async () => {
    if (!videoRef.current) return;
    if (videoRef.current.readyState < 2) {
      alert("Webcam not ready yet, please wait a moment.");
      return;
    }

    // Capture webcam frame
    const canvasEl = document.createElement("canvas");
    canvasEl.width = videoRef.current.videoWidth || 640;
    canvasEl.height = videoRef.current.videoHeight || 480;
    const ctx = canvasEl.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvasEl.width, canvasEl.height);
    const imageData = canvasEl.toDataURL("image/jpeg");

    const email = localStorage.getItem("email");
    if (!email) {
      alert("Email not found. Please login again.");
      return;
    }

    try {
      setVerifying(true); // ✅ Show loading spinner
      const res = await fetch(
        `http://localhost:5000/api/verify-identity/${currentChallenge._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, image: imageData }),
        }
      );

      const data = await res.json();
      console.log("Verification response:", data);

      setVerifying(false); // ✅ Stop loading spinner

      if (data.verified) {
        setIdentityVerified(true);
        stopWebcam();
        setModalOpen(false);
        navigate(`/challenge/${currentChallenge._id}`);
      } else {
        let msg = `❌ Identity verification failed. Distance: ${data.distance?.toFixed(2) || "N/A"}`;
        if (data.message) msg += `\nInfo: ${data.message}`;
        alert(msg);
      }
    } catch (err) {
      setVerifying(false);
      console.error(err);
      alert("⚠️ Server error during identity verification.");
    }
  };

  const handleCloseModal = () => {
    stopWebcam();
    setModalOpen(false);
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  if (loading) return <p>Loading challenges...</p>;

  return (
    <div className="challenges-page">
      <NavbarStudent />
      <div className="challenges-container">
        <h1>Challenges</h1>
        {challenges.length === 0 ? (
          <p>No challenges found.</p>
        ) : (
          <div className="challenge-list">
            {challenges.map((challenge) => (
              <div key={challenge._id} className="challenge-card">
                <h3>{challenge.title}</h3>
                <p>{challenge.description.substring(0, 120)}...</p>
                <p><strong>Difficulty:</strong> {challenge.difficulty}</p>
                <p><strong>Start Time:</strong> {new Date(challenge.startTime).toLocaleString()}</p>
                <button onClick={() => handleStart(challenge)} className="start-btn">
                  Start Challenge
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            {step === 1 && (
              <>
                <h2>Terms & Conditions</h2>
<div className="tc-container">
  <ul>
    <li>No malpractice is allowed. Any form of cheating will lead to disqualification.</li>
   <li>Complete the challenge within the given time frame. Late submissions will not be accepted.</li>
    <li>You may switch programming languages in the code editor as allowed by the challenge.</li>
    <li>Report issues or bugs to <strong>algoodyssey@gmail.com</strong>.</li>
   <li>Maintain academic honesty and integrity throughout the challenge.</li>
    <li>Follow any instructions or rules set by the challenge organizers.</li>
    <li>Do not attempt to impersonate other participants.</li>
    <li>Mobile or desktop notifications should be managed to avoid distraction during the challenge.</li>
    <li>Report unexpected behavior or bugs immediately to the admin.</li>
    <li>Challenge organizers reserve the right to disqualify participants for any misconduct.</li>
   <li>All submissions should be your original work.</li>
    <li>Respect deadlines and system limitations.</li>
    <li>By participating, you agree to abide by these rules and any future updates.</li>
    <li>Use polite language and behavior in any communication related to the challenge.</li>
    <li>All decisions by the organizers are final and binding.</li>
    <li>Participants must not share sensitive information outside the platform.</li>
   <li>Any attempt to disrupt the challenge environment will result in immediate disqualification.</li>
  </ul>
</div>

                <div>
                  <input
                    type="checkbox"
                    id="agreeTC"
                    checked={agreeTC}
                    onChange={(e) => setAgreeTC(e.target.checked)}
                  />
                  <label htmlFor="agreeTC"> I agree to all Terms & Conditions</label>
                </div>
                <button
                  className="btn"
                  onClick={handleNext}
                  disabled={!agreeTC}
                >
                  Next
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2>Identity Verification</h2>
                <video ref={videoRef} autoPlay width="320" height="240" />
                <button className="btn" onClick={handleNext} disabled={verifying}>
                  {verifying ? "Verifying..." : "Capture & Verify"}
                </button>
                {verifying && <p>🔄 Checking identity, please wait...</p>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
*/