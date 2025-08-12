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
	getUserById,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import {
	authLimiter,
	passwordResetLimiter,
	emailVerificationLimiter
} from "../middleware/security.js";
import passport from "../config/passport.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

const router = express.Router();

// Auth check (no rate limiting needed for this)
router.get("/check-auth", verifyToken, checkAuth);
router.get("/user/:userId", verifyToken, getUserById);

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

// OAuth routes
router.get("/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
	passport.authenticate("google", { session: false }),
	async (req, res) => {
		try {
			// Generate JWT token for the authenticated user
			const token = generateTokenAndSetCookie(res, req.user._id, req.user.role);

			// Redirect to frontend with success
			const redirectURL = process.env.NODE_ENV === "production"
				? `${process.env.CLIENT_URL}/dashboard?auth=success`
				: `http://localhost:5173/dashboard?auth=success`;

			res.redirect(redirectURL);
		} catch (error) {
			console.error("OAuth callback error:", error);
			const redirectURL = process.env.NODE_ENV === "production"
				? `${process.env.CLIENT_URL}/login?error=oauth_failed`
				: `http://localhost:5173/login?error=oauth_failed`;

			res.redirect(redirectURL);
		}
	}
);

export default router;
