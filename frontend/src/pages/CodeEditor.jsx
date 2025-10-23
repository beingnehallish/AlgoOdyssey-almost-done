import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";

import "../styles/CodeEditor.css";

export default function CodeEditor() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const email = localStorage.getItem("email");
const userId = localStorage.getItem("userId");

  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState("// Write your code here");
  const [testResults, setTestResults] = useState([]);
  const [hiddenResults, setHiddenResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [hiddenRunning, setHiddenRunning] = useState(false);
  const [language, setLanguage] = useState("JavaScript");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const languages = ["JavaScript", "Python", "C", "C++", "Java", "Go", "Rust", "PHP"];
  const monacoLangMap = {
    JavaScript: "javascript",
    Python: "python",
    C: "c",
    "C++": "cpp",
    Java: "java",
    Go: "go",
    Rust: "rust",
    PHP: "php",
  };
  // ✅ New modal & fullscreen states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [countdown, setCountdown] = useState(5);
  // 🚨 Malpractice detection states
const [malpracticeCount, setMalpracticeCount] = useState(0);
const [showMalpracticeWarning, setShowMalpracticeWarning] = useState(false);

    useEffect(() => {
    fetchChallenge();
    enterFullscreen(); // ✅ auto fullscreen on mount

    // listen for ESC or exiting fullscreen
    window.addEventListener("keydown", handleEscPress);
document.addEventListener("fullscreenchange", handleFullscreenChange);

// 🚨 Malpractice detection listeners
window.addEventListener("copy", handleMalpractice);
window.addEventListener("cut", handleMalpractice);
window.addEventListener("paste", handleMalpractice);
window.addEventListener("blur", handleMalpractice); // when user switches tab or window
window.addEventListener("visibilitychange", handleVisibilityChange);

   return () => {
  window.removeEventListener("keydown", handleEscPress);
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
  window.removeEventListener("copy", handleMalpractice);
  window.removeEventListener("cut", handleMalpractice);
  window.removeEventListener("paste", handleMalpractice);
  window.removeEventListener("blur", handleMalpractice);
  window.removeEventListener("visibilitychange", handleVisibilityChange);
};

  }, [id]);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.error("Fullscreen error:", err));
    }
  };

  const handleEscPress = (e) => {
    if (e.key === "Escape") {
      setShowFullscreenWarning(true);
      setCountdown(5);
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      setShowFullscreenWarning(true);
      setCountdown(5);
    } else {
      setShowFullscreenWarning(false);
    }
  };
// 🚨 Handle malpractice attempts like copy/paste or tab switch
const handleMalpractice = (e) => {
  e.preventDefault();
  triggerMalpractice();
};

// 🚨 Detect when tab is hidden or user switches windows
const handleVisibilityChange = () => {
  if (document.hidden) triggerMalpractice();
};

const triggerMalpractice = () => {
  if (malpracticeCount >= 1) {
    // Second offense → remove from challenge
    navigate("/challenges");
  } else {
    // First warning
    setShowMalpracticeWarning(true);
    setMalpracticeCount(prev => prev + 1);
  }
};

  // countdown logic when fullscreen warning appears
  useEffect(() => {
    if (!showFullscreenWarning) return;
    if (countdown <= 0) {
      navigate("/challenges");
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, showFullscreenWarning]);
useEffect(() => {
  if (!challenge) return;
  const storedStart = localStorage.getItem(`challengeStart_${id}`);
  if (!storedStart) return;

  const startTime = new Date(storedStart).getTime();
  const timeLimit = parseInt(challenge.timeLimit, 10) || 300;
  const endTime = startTime + timeLimit * 1000;

  const update = () => {
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    setTimeLeft(remaining);

    if (remaining <= 0) {
      clearInterval(timer);
      alert("Time's up!");
      navigate("/challenges");
    }
  };

  const timer = setInterval(update, 1000);
  update();

  // ✅ listen for stop-timer event
  const stopListener = () => clearInterval(timer);
  window.addEventListener("stop-timer", stopListener);

  return () => {
    clearInterval(timer);
    window.removeEventListener("stop-timer", stopListener);
  };
}, [challenge, id, navigate]);

  const fetchChallenge = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/challenges/${id}`);
    if (!res.ok) throw new Error("Challenge not found");
    const data = await res.json();
    setChallenge(data);
    setCode(data.starterCode?.[language] || "// Write your code here");

    // Handle persistent timer
    // ✅ Always use actual DB startTime — never reset locally
const startTime = new Date(data.startTime).getTime();
localStorage.setItem(`challengeStart_${id}`, data.startTime);


    const endTime = startTime + (parseInt(data.timeLimit, 10) || 300) * 1000;

    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    setTimeLeft(remaining);
if (remaining <= 0) {
  alert("Time's up!");
  navigate("/challenges");
  return;
}

  } catch (err) {
    console.error("Failed to fetch challenge:", err);
  }
};

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    if (challenge) setCode(challenge.starterCode?.[lang] || "// Write your code here");
  };

  const handleRun = async () => {
    if (!challenge) return;
    setRunning(true);
    setTestResults([]);
    setHiddenResults([]);

    const visibleTestCases = challenge.testCases.slice(0, 5);
    const hiddenTestCases = challenge.testCases.slice(5, 10);

    try {
      // Run visible test cases
      const res1 = await fetch("http://localhost:5000/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, testCases: visibleTestCases, language }),
      });
      const data1 = await res1.json();
      if (res1.ok) {
        const results = data1.results.map(r => ({
          ...r,
          got: String(r.got || "").trim(),
          expected: String(r.expected || "").trim(),
          passed: String(r.got || "").trim() === String(r.expected || "").trim(),
          runtime: typeof r.runtime === "number" ? r.runtime : 0,
        }));
        setTestResults(results);
      }

      // Run hidden test cases
      if (hiddenTestCases.length > 0) {
        setHiddenRunning(true);
        try {
          const res2 = await fetch("http://localhost:5000/api/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, testCases: hiddenTestCases, language }),
          });
          const data2 = await res2.json();
          if (res2.ok) {
            const hidden = data2.results.map(r => ({
              ...r,
              got: String(r.got || "").trim(),
              expected: String(r.expected || "").trim(),
              passed: String(r.got || "").trim() === String(r.expected || "").trim(),
              runtime: typeof r.runtime === "number" ? r.runtime : 0,
            }));
            setHiddenResults(hidden);
          }
        } finally {
          setHiddenRunning(false);
        }
      }
    } catch (err) {
      console.error("Error running code:", err);
    } finally {
      setRunning(false);
    }
  };

  const handleCustomRun = async () => {
    if (!challenge) return;
    setCustomOutput("Running...");
    try {
      const res = await fetch("http://localhost:5000/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          testCases: [{ input: customInput, expectedOutput: "" }],
          language
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCustomOutput(data.results[0]?.got || "No output");
      } else {
        setCustomOutput(data.message || "Error running custom input");
      }
    } catch (err) {
      setCustomOutput("Error: " + err.toString());
    }
  };

 
  // ✅ Opens confirmation modal
  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  // ✅ Actually submits when user confirms
  const confirmSubmit = async () => {
    if (!challenge) return;
    localStorage.removeItem(`challengeStart_${id}`);
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("User not logged in!");

    const allResults = [...testResults, ...hiddenResults];
    const passedCount = allResults.filter(r => r.passed).length;
    const correctnessScore = allResults.length > 0
      ? (passedCount / allResults.length) * 100
      : 0;
    const timeTaken = (challenge.timeLimit || 300) - timeLeft;

    try {
      const res = await fetch("http://localhost:5000/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          challengeId: challenge._id,
          code,
          language,
          timeTaken,
          correctnessScore
        }),
      });
localStorage.removeItem(`challengeStart_${id}`);
setTimeLeft(0); // reset UI timer
window.dispatchEvent(new Event("stop-timer"));

      if (res.ok) {
        navigate("/challenges");
      } else {
        const data = await res.json();
        alert("Error: " + data.message);
      }
    } catch (err) {
      alert("Error submitting code: " + err.message);
    }
  };



  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!challenge) return <p>Loading challenge...</p>;

  // Compute correctnessScore for sidebar
  const allResults = [...testResults, ...hiddenResults];
  const correctnessScore = allResults.length > 0
    ? (allResults.filter(r => r.passed).length / allResults.length) * 100
    : 0;

  const passedCount = testResults.filter(r => r.passed).length;
  const hiddenPassedCount = hiddenResults.filter(r => r.passed).length;

  return (
    <div className="codeeditor-wrapper fullscreen-mode">

      <div className="editor-container">
        <div className="problem-section">
          <h2>{challenge.title}</h2>
          <p>{challenge.description}</p>
          <p><strong>Time Left:</strong> {formatTime(timeLeft)}</p>
        </div>

        <div className="editor-controls">
          <label>
            Language:{" "}
            <select value={language} onChange={handleLanguageChange}>
              {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </label>
        </div>

        <MonacoEditor
          height="60vh"
          language={monacoLangMap[language] || "javascript"}
          theme="vs-dark"
          value={code}
          onChange={setCode}
          options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: "on", automaticLayout: true }}
        />

        <div className="editor-buttons">
          <button onClick={handleRun} disabled={running}>{running ? "Running..." : "Run"}</button>
          <button onClick={handleSubmit}>Submit</button>
        </div>

        <div className="output-section">
          <h4>Console Output</h4>
          {testResults.length > 0 && (
            <div>
              {testResults.map((r, i) => (
                <pre key={i}>{r.got}</pre>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <h4>Visible Test Cases: {passedCount}/5 Passed</h4>
        {challenge.testCases.slice(0, 5).map((test, i) => {
          const result = testResults[i];
          return (
            <div key={i} className="testcase">
              <button className="testBtn">Input: {test.input} | Expected: {test.expectedOutput}</button>
              {result?.passed && <span className="tick">✅</span>}
              {result && !result.passed && <span className="failedMark">❌</span>}
              {result && !result.passed && result.got && <pre className="error-output">Got: {result.got}</pre>}
            </div>
          );
        })}

        <h4>Hidden Test Cases: {hiddenPassedCount}/5 Passed</h4>
        {hiddenRunning && (
          <div className="hidden-loading">
            <span className="spinner"></span> Running hidden test cases...
          </div>
        )}

        <div className="custom-input-section">
          <h4>Try Your Own Input</h4>
          <textarea
            placeholder="Enter custom input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />
          <button onClick={handleCustomRun}>Run Custom Input</button>
          {customOutput && <pre className="custom-output">{customOutput}</pre>}
        </div>

        <div className="scores-section">
          <p><strong>Correctness Score:</strong> {correctnessScore.toFixed(2)}%</p>
        </div>
      </div>
            {/* ✅ Confirmation Modal */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to submit and exit the challenge?</p>
            <div className="modal-actions">
              <button onClick={confirmSubmit}>Yes</button>
              <button onClick={() => setShowSubmitModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Fullscreen Warning Modal */}
      {showFullscreenWarning && (
        <div className="modal-overlay warning">
          <div className="modal">
            <p>You exited fullscreen! Enter fullscreen or you’ll be removed from the test in:</p>
            <h3>{countdown} seconds</h3>
            <button onClick={enterFullscreen}>Enter Fullscreen</button>
          </div>
        </div>
      )}
      {/* 🚨 Malpractice Warning Modal */}
{showMalpracticeWarning && (
  <div className="modal-overlay warning">
    <div className="modal">
      <p>This is your final warning.</p>
      <div className="modal-actions">
        <button
          onClick={() => {
            setShowMalpracticeWarning(false);
            enterFullscreen(); // re-enter fullscreen if exited
          }}
        >
          Continue Test
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}
