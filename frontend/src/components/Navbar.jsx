// Navbar.jsx
export default function Navbar() {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <button onClick={() => scrollToSection("about")}>About</button>
        </li>
        <li>
          <button onClick={() => scrollToSection("features")}>Features</button>
        </li>
        <li>
          <button onClick={() => scrollToSection("contact")}>Contact</button>
        </li>
      </ul>
    </nav>
  );
}

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}
