import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["faculty", "security", "admin"],
      default: "faculty",
    },
    department: {
      type: String,
      enum: [
        "CSE", // Computer Science Engineering
        "EEE", // Electrical and Electronics Engineering
        "AIML", // Artificial Intelligence and Machine Learning
        "IoT", // Internet of Things
        "ECE", // Electronics and Communication Engineering
        "MECH", // Mechanical Engineering
        "CIVIL", // Civil Engineering
        "IT", // Information Technology
        "ADMIN", // Administration
        "RESEARCH" // Research Department
      ],
      default: null, // null means no department restriction (for admin/security)
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
