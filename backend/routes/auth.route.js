import express from "express";
import {
	login,
	logout,
	signup,
	verifyEmail,
	resendVerificationEmail,
	forgotPassword,
	resetPassword,
	checkAuth,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import {
	authLimiter,
	passwordResetLimiter,
	emailVerificationLimiter
} from "../middleware/security.js";

const router = express.Router();

// Auth check (no rate limiting needed for this)
router.get("/check-auth", verifyToken, checkAuth);

// Authentication endpoints with rate limiting
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/logout", logout); // No rate limiting for logout

// Email verification with specific rate limiting
router.post("/verify-email", emailVerificationLimiter, verifyEmail);
router.post("/resend-verification", emailVerificationLimiter, resendVerificationEmail);

// Password reset with strict rate limiting
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password/:token", passwordResetLimiter, resetPassword);

export default router;
