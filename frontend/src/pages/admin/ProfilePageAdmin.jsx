import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AdminDashboardUnique.css";

export default function ProfilePageAdmin() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "Admin",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const email = localStorage.getItem("email");
        if (!email) {
          navigate("/login");
          return;
        }

        const res = await fetch(`http://localhost:5000/api/profile/${email}`);
        const data = await res.json();

        if (data.user) {
          setAdmin(data.user);
          setFormData({
            fullName: data.user.fullName,
            email: data.user.email,
            role: data.user.role || "Admin",
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setPreview(
            data.user.image
              ? `http://localhost:5000${data.user.image}`
              : "https://via.placeholder.com/120"
          );
        }
      } catch (err) {
        console.error("❌ Failed to fetch admin info:", err);
      }
    };

    fetchAdmin();
  }, [navigate]);

  if (!admin)
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading profile...</p>;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const form = new FormData();
      form.append("fullName", formData.fullName);

      if (selectedImage) form.append("image", selectedImage);
      if (formData.oldPassword || formData.newPassword || formData.confirmPassword) {
        form.append("oldPassword", formData.oldPassword);
        form.append("newPassword", formData.newPassword);
        form.append("confirmPassword", formData.confirmPassword);
      }

      const res = await fetch(`http://localhost:5000/api/profile/${formData.email}`, {
        method: "PUT",
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        setAdmin(data.user);
        setEditMode(false);
        setMessage("✅ Profile updated successfully!");
      } else {
        setMessage(data.message || "❌ Update failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error. Try again later.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
     <div className="adm-profile-wrapper">
      <div className="adm-profile-container">
        <h1>Admin Profile</h1>
        {message && <p className="adm-profile-message">{message}</p>}

        <div className="adm-profile-card">
          <div className="adm-profile-left">
            <img
              src={preview}
              alt="Admin Avatar"
              className="adm-profile-avatar"
            />
            {editMode && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="adm-upload-input"
              />
            )}
          </div>

          <div className="adm-profile-right">
            {editMode ? (
              <>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="adm-input"
                />
                <p><strong>Email:</strong> {formData.email}</p>

                <hr />
                <h3>Change Password</h3>
                <input
                  type="password"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  placeholder="Old Password"
                  className="adm-input"
                />
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="New Password"
                  className="adm-input"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="adm-input"
                />

                <div className="adm-profile-buttons">
                  <button className="adm-btn primary" onClick={handleSave}>
                    Save
                  </button>
                  <button
                    className="adm-btn secondary"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                  <button className="adm-btn logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>{admin.fullName}</h2>
                <p><strong>Email:</strong> {admin.email}</p>
                <p><strong>Role:</strong> {admin.role}</p>

                <div className="adm-profile-buttons">
                  <button className="adm-btn primary" onClick={() => setEditMode(true)}>
                    Edit Profile
                  </button>
                  <button className="adm-btn logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
