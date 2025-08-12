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
      required: function() {
        // Password is required only for local authentication
        return !this.googleId;
      },
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
    // OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    avatar: {
      type: String, // URL to profile picture
      default: null,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: function() {
        // OAuth users are automatically verified
        return this.provider === "google";
      },
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
