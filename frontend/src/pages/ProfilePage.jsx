import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";
import NavbarStudent from "../components/NavbarStudent";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    seatNumber: "",
    email: "",
    role: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const email = localStorage.getItem("email");
        if (!email) {
          navigate("/"); // redirect to login if no email found
          return;
        }

        const res = await fetch(`http://localhost:5000/api/profile/${email}`);
        const data = await res.json();

        if (data.user) {
          setUser(data.user);
          setFormData({
            fullName: data.user.fullName,
            seatNumber: data.user.seatNumber,
            email: data.user.email,
            role: data.user.role,
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setPreview(
            data.user.image
              ? `http://localhost:5000${data.user.image}`
              : ""
          );
        }
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };

    fetchUser();
  }, [navigate]);

  if (!user)
    return (
      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        Loading profile details...
      </p>
    );

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
    form.append("seatNumber", formData.seatNumber);

    if (selectedImage) {
      form.append("image", selectedImage); // face detection will run server-side
    }

    if (formData.oldPassword || formData.newPassword || formData.confirmPassword) {
      form.append("oldPassword", formData.oldPassword);
      form.append("newPassword", formData.newPassword);
      form.append("confirmPassword", formData.confirmPassword);
    }

    const res = await fetch(
      `http://localhost:5000/api/profile/${formData.email}`,
      {
        method: "PUT",
        body: form, // send as multipart/form-data
      }
    );

    const data = await res.json();

    if (res.ok) {
      if (!data.user.faceDescriptor || data.user.faceDescriptor.length === 0) {
        alert("⚠️ No face detected in profile image. Please upload a clear frontal photo.");
        return;
      }
      setUser(data.user);
      setEditMode(false);
      setMessage("Profile updated successfully!");
    } else {
      setMessage(data.message || "Update failed.");
    }
  } catch (err) {
    console.error(err);
    setMessage("Server error. Please try again later.");
  }
};

  const handleLogout = () => {
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <div>
      <NavbarStudent/>
      <div className="profile-container">
        <h1>Your Profile</h1>

        {message && (
          <p style={{ textAlign: "center", color: "green" }}>{message}</p>
        )}

        <div className="profile-card">
          <div className="profile-details">
            <div className="profile-image">
              <img
                src={
                  preview ||
                  `http://localhost:5000${user.image}` ||
                  "https://via.placeholder.com/120"
                }
                alt="Profile"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              {editMode && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="upload-input"
                />
              )}
            </div>

            {editMode ? (
              <>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                />
                <input
                  type="text"
                  name="seatNumber"
                  value={formData.seatNumber}
                  onChange={handleChange}
                  placeholder="Employee ID"
                />
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>

                <hr style={{ margin: "1rem 0" }} />

                <h3>Change Password</h3>
                <input
                  type="password"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  placeholder="Old Password"
                />
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="New Password"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                />

                <div className="profile-buttons">
                  <button className="btn" onClick={handleSave}>
                    Save
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>{user.fullName}</h2>
                <p>
                  <strong>Employee ID:</strong> {user.seatNumber}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>

                <div className="profile-buttons">
                  <button className="btn" onClick={() => setEditMode(true)}>
                    Edit Profile
                  </button>
                  <button className="btn btn-logout" onClick={handleLogout}>
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
