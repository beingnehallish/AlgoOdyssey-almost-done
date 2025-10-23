import express from "express";
import User from "../models/User.js";
import * as faceapi from "face-api.js";
import canvas from "canvas";
import path from "path";
import fs from "fs";
import multer from "multer";

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const router = express.Router();

// Multer setup
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Load face-api models on server start
const MODEL_PATH = path.join(process.cwd(), "face_models");
await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);

/**
 * POST /api/register
 */
router.post("/register", async (req, res) => {
  const { seatNumber, fullName, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already registered" });

    const newUser = new User({ seatNumber, fullName, email, password, role });
    await newUser.save();
    res.status(201).json({ message: "User created", user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/login
 */
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ email, role });
    if (!user) return res.status(401).json({ message: "Invalid email or role" });
    if (user.password !== password) return res.status(401).json({ message: "Incorrect password" });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        seatNumber: user.seatNumber,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/profile/:email
 */
router.get("/profile/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/profile/:email
 * Updates profile info, password, and uploads face image.
 */
router.put("/profile/:email", upload.single("image"), async (req, res) => {
  try {
    const { fullName, seatNumber, oldPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName) user.fullName = fullName;
    if (seatNumber) user.seatNumber = seatNumber;

    // Password update
    // Password update: only if user is actually trying to change it
if (newPassword || confirmPassword) {
  if (!oldPassword) return res.status(400).json({ message: "Old password is required to change password" });
  if (oldPassword !== user.password) return res.status(400).json({ message: "Old password is incorrect" });
  if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });
  user.password = newPassword;
}


    // Profile image & face descriptor
    if (req.file) {
      const imagePath = req.file.path;
      user.image = `/uploads/${req.file.filename}`;

      const img = await canvas.loadImage(imagePath);
      const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

      if (!detection) {
        console.log("No face detected in uploaded image");
        return res.status(400).json({ message: "No face detected in uploaded image" });
      }

      user.faceDescriptor = Array.from(detection.descriptor);
      console.log("Face descriptor saved:", user.faceDescriptor.length);
    }

    await user.save({ validateModifiedOnly: true });
    res.json({ user, message: "Profile updated successfully!" });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error during profile update" });
  }
});

/**
 * POST /api/verify-identity/:challengeId
 * Verifies a user using webcam image
 */
router.post("/verify-identity/:challengeId", async (req, res) => {
  try {
    const { email, image } = req.body;
    if (!email || !image) return res.status(400).json({ verified: false, message: "Missing email or image" });

    const user = await User.findOne({ email });
    if (!user?.faceDescriptor?.length)
      return res.status(404).json({ verified: false, message: "No reference image" });

    // Convert base64 to buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const img = await canvas.loadImage(buffer);
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

    if (!detection) {
      console.log("No face detected in webcam image");
      return res.status(400).json({ verified: false, message: "No face detected in webcam image" });
    }

    const queryDescriptor = detection.descriptor;
    const referenceDescriptor = new Float32Array(user.faceDescriptor);

    const distance = faceapi.euclideanDistance(queryDescriptor, referenceDescriptor);
    const threshold = 0.65;
    const verified = distance < threshold;

    console.log("Distance:", distance, "Verified:", verified);

    res.json({ verified, distance, message: "Face verification completed" });
  } catch (err) {
    console.error("Identity verification error:", err);
    res.status(500).json({ verified: false, message: "Server error during identity verification" });
  }
});

export default router;
