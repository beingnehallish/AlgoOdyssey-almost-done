// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    seatNumber: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // only email now
    password: { 
      type: String, 
      required: [function() { return this.isNew; }, "Password is required."] 
    },
    role: { type: String, enum: ["student", "admin"], required: true },
    image: { type: String },
    faceDescriptor: { type: [Number], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
