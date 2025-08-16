import express from "express";
import {
	logout,
	checkAuth,
	getUserById,
	completeRegistration,
	checkRegistrationStatus,
	updateProfile,
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

// Registration endpoints
router.get("/registration-status", verifyToken, checkRegistrationStatus);
router.post("/complete-registration", verifyToken, authLimiter, completeRegistration);

// Profile endpoints
router.put("/update-profile", verifyToken, authLimiter, updateProfile);

// Logout (no rate limiting for logout)
router.post("/logout", logout);

// Development only - Clear all users
if (process.env.NODE_ENV === 'development') {
	router.delete("/clear-users", async (req, res) => {
		try {
			const { User } = await import("../models/user.model.js");
			const result = await User.deleteMany({});
			console.log(`🗑️ Cleared ${result.deletedCount} users from database`);
			res.json({
				success: true,
				message: `Cleared ${result.deletedCount} users from database`,
				deletedCount: result.deletedCount
			});
		} catch (error) {
			console.error("Error clearing users:", error);
			res.status(500).json({ success: false, message: "Failed to clear users" });
		}
	});
}

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

			const frontendURL = process.env.NODE_ENV === "production"
				? "https://dev-keys.vjstartup.com"
				: process.env.CLIENT_URL || "http://dev-keys.vjstartup.com";

			// Check if user needs to complete registration
			const needsRegistration = req.user.role === 'pending' ||
				(req.user.role === 'faculty' && (!req.user.department || !req.user.facultyId));

			let redirectURL;
			if (needsRegistration) {
				redirectURL = `${frontendURL}/complete-registration?auth=success`;
				console.log("🔗 New user - redirecting to registration:", redirectURL);
			} else {
				redirectURL = `${frontendURL}/dashboard?auth=success`;
				console.log("🔗 Existing user - redirecting to dashboard:", redirectURL);
			}

			res.redirect(redirectURL);
		} catch (error) {
			console.error("OAuth callback error:", error);
			const frontendURL = process.env.NODE_ENV === "production"
				? "https://dev-keys.vjstartup.com"
				: process.env.CLIENT_URL || "http://dev-keys.vjstartup.com";

			const redirectURL = `${frontendURL}/login?error=oauth_failed`;
			console.log("❌ Error redirect to:", redirectURL);

			res.redirect(redirectURL);
		}
	}
);

export default router;
