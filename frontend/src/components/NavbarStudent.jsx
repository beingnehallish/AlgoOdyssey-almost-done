import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaCode, FaFileAlt, FaUser } from "react-icons/fa";
import "../styles/NavbarStudent.css";

export default function NavbarStudent() {
  const navItems = [
    { path: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { path: "/challenges", icon: <FaCode />, label: "Challenges" },
    { path: "/submissions", icon: <FaFileAlt />, label: "Submissions" },
    { path: "/profile", icon: <FaUser />, label: "Profile" },
  ];

  return (
    <header className="navbar-student">
      <div className="logo">Algo Odyssey</div>
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
