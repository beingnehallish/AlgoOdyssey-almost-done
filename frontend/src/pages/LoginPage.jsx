import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import "../styles/LoginPage.css";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const navigate = useNavigate();
const [time, setTime] = useState(new Date());
const [hourDeg, setHourDeg] = useState(0);
const [minuteDeg, setMinuteDeg] = useState(0);
const [secondDeg, setSecondDeg] = useState(0);

useEffect(() => {
  const updateClock = () => {
    const now = new Date();
    setTime(now);

    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    setHourDeg((hours + minutes / 60) * 30); // 360/12 = 30deg per hour
    setMinuteDeg((minutes + seconds / 60) * 6); // 360/60 = 6deg per minute
    setSecondDeg(seconds * 6); // 360/60 = 6deg per second
  };

  updateClock(); // initial call
  const timer = setInterval(updateClock, 1000);
  return () => clearInterval(timer);
}, []);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }
          localStorage.setItem("userId", data.user.id);
    localStorage.setItem("email", data.user.email);
    localStorage.setItem("role", data.user.role);


      // Redirect based on role
      if (data.user.role === "student") navigate("/dashboard");
      else if (data.user.role === "admin") navigate("/admin");

    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    }
  }

  return (
    
    <div className="login-wrapper">
      <div className="analog-clock">
  <div className="hand hour" style={{ transform: `rotate(${hourDeg}deg)` }}></div>
  <div className="hand minute" style={{ transform: `rotate(${minuteDeg}deg)` }}></div>
  <div className="hand second" style={{ transform: `rotate(${secondDeg}deg)` }}></div>
  <div className="center-dot"></div>
</div>


  <div className="login-container">
      <h2>Ready, Set, Go!</h2>

      <div className="role-toggle">
        <button
          type="button"
          className={role === "student" ? "active" : ""}
          onClick={() => setRole("student")}
        >
          Student
        </button>
        <button
          type="button"
          className={role === "admin" ? "active" : ""}
          onClick={() => setRole("admin")}
        >
          Admin
        </button>
      </div>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn">Login</button>
      </form>
    </div>
    </div>
  );
}
