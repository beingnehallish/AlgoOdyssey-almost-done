import { useState } from "react";
import "../styles/AdminDashboardUnique.css"; // unique CSS
import ProfilePageAdmin from "./admin/ProfilePageAdmin";
import NewChallenge from "./admin/NewChallenge";
import ViewChallenges from "./admin/ViewChallenges";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "new-challenge":
        return <NewChallenge />;
      case "adm-profile":
        return <ProfilePageAdmin />;
      case "view-challenges":
        return <ViewChallenges />;
      default:
        return (
          <div className="adm-unique-welcome">
            <h1>Welcome, Admin!</h1>
            <p>Select an option from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="adm-unique-dashboard">
      {/* Sidebar */}
      <aside className="adm-unique-sidebar">
        <h2 className="adm-unique-sidebar-title">Admin Panel</h2>
        <ul className="adm-unique-sidebar-menu">
          <li
            className={activeTab === "new-challenge" ? "adm-unique-active" : ""}
            onClick={() => setActiveTab("new-challenge")}
          >
            ➕ New Challenge
          </li>
          <li
            className={activeTab === "adm-profile" ? "adm-unique-active" : ""}
            onClick={() => setActiveTab("adm-profile")}
          >
            👤 Profile Tab
          </li>
          <li
            className={activeTab === "view-challenges" ? "adm-unique-active" : ""}
            onClick={() => setActiveTab("view-challenges")}
          >
            📋 View Challenges
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="adm-unique-main">{renderContent()}</main>
    </div>
  );
}
