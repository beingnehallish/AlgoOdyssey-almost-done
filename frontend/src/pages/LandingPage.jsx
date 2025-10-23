import "../styles/LandingPage.css";
import a1 from "../assets/a1.jpeg";
import a2 from "../assets/a2.jpg";
import a3 from "../assets/a3.jpg";
import a4 from "../assets/a4.jpg";
import h1 from "../assets/h1.jpg";
import h2 from "../assets/h2.jpg";
import h3 from "../assets/h3.jpg";
import h4 from "../assets/h4.jpg";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const images = [a1, a2, a3, a4];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);
  // Team data
  const teamMembers = [
    { img: h1, name: "Mahi Verma", usn: "1JB22IS082" , github: "https://github.com/beingnehallish", linkedin: "https://linkedin.com/in/nehal--gupta"},
    { img: h2, name: "Nehal Gupta", usn: "1JB22IS099" , github: "https://github.com/nehal", linkedin: "https://linkedin.com/in/mahi-verma-19ba49288"},
    { img: h3, name: "Prathvi Patil", usn: "1JB22IS110", github: "https://github.com/nehal", linkedin: "https://linkedin.com/in/prathvi-d-patil" },
    { img: h4, name: "Punya Shree SR", usn: "1JB22IS119", github: "https://github.com/nehal", linkedin: "https://linkedin.com/in/punya-shree-s-r-549616368" },
  ];

  return (
    <div className="landing-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">Algo Odyssey</div>
        <nav>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="/login" className="btn-primary">Login</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero">

        <div className="hero-content">
          <h1>LEVEL UP YOUR CODING JOURNEY.</h1>
          <p>
            Compete, learn, and improve with consistency, folks.  
            Rise through the ranks with efficient solutions & unprecedented progress.
          </p>
          <div className="hero-buttons">
            <a href="#about" className="btn-primary">Our Team</a>
            <a href="/login" className="btn-secondary">Login</a>
          </div>
        </div>

        {/* Sliding Window of Images */}
        <div className="hero-image">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Slide ${index + 1}`}
              className={`slide ${index === currentIndex ? "active" : ""}`}
            />
          ))}
        </div>
      </section>

{/* Features Section */}
<section id="features" className="features-section">
  {/* Centered Heading */}
  <h2 className="features-heading">What do we Offer ?</h2>

  <div className="features">
    <div className="feature">
    <h3>💻 New Challenges</h3>
    <p>
      Each challenge is carefully curated to cover data structures, algorithms, and real-world 
      problem-solving scenarios — perfect for consistent practice and growth.
    </p>
  </div>

  <div className="feature">
    <h3>🏆 Smart Rankings</h3>
    <p>
      Compete with your peers on a smart leaderboard that 
      evaluates your code’s efficiency. Climb the ranks 
      by writing clean, optimized solutions faster than others!
    </p>
  </div>

  <div className="feature">
    <h3>🤖 AI Monitoring</h3>
    <p>
      Our AI-powered monitoring ensures a fair competition environment. It detects 
      malpractices during live contests — making sure 
      every participant wins on merit.
    </p>
  </div>

  <div className="feature">
    <h3>📊 Personalized Stats</h3>
    <p>
      Track your performance by keeping a track of your code's optimility. 
      You'll be stunned to see how your efficiency improves with each challenge!
    </p>
  </div>

  <div className="feature">
    <h3>🌐 Community & Compedition</h3>
    <p>
      Connect with fellow coders & learn together. 
      Grow as a part of a vibrant developer community that motivates you to do better using competitive coding.
    </p>
  </div></div>
</section>


      {/* About Section */}
      <section id="about" className="about">
        <h2>About Us</h2>
        <p>Algo Odyssey is built to make coding practice fun, competitive, and consistent.</p>
 <div className="team-container">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="team-member">
              <img src={member.img} alt={member.name} className="team-photo" />
              <p className="team-name">{member.usn} - {member.name}</p>
<div className="team-links">
  <a href={member.github} target="_blank" rel="noopener noreferrer">GitHub</a> | 
  &nbsp;<a href={member.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
</div>
 </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <h2>Contact</h2>
        <p>Reach us anytime at <strong>support@algoodyssey.com</strong></p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Algo Odyssey. All rights reserved.</p>
      </footer>
    </div>
  );
}
