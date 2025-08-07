import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "../nodemailer/emails.js";
import { User } from "../models/user.model.js";
import {
	validateEmail,
	validatePassword,
	validateName,
	validateVerificationCode,
	validateResetToken,
	sanitizeEmail,
} from "../utils/validation.js";
import {
	ValidationError,
	AuthenticationError,
	ConflictError,
	NotFoundError,
	asyncHandler,
} from "../utils/errorHandler.js";

export const signup = asyncHandler(async (req, res) => {
	const { email, password, name, role = 'operator' } = req.body;

	// Validate input
	const emailValidation = validateEmail(email);
	if (!emailValidation.isValid) {
		throw new ValidationError(emailValidation.message);
	}

	const passwordValidation = validatePassword(password);
	if (!passwordValidation.isValid) {
		throw new ValidationError(passwordValidation.message);
	}

	const nameValidation = validateName(name);
	if (!nameValidation.isValid) {
		throw new ValidationError(nameValidation.message);
	}

	// Validate role
	const validRoles = ['admin', 'operator', 'responder'];
	if (!validRoles.includes(role)) {
		throw new ValidationError('Invalid role selected');
	}

	// Sanitize inputs
	const sanitizedEmail = sanitizeEmail(email);
	const sanitizedName = nameValidation.sanitizedValue;

	// Check if user already exists
	const existingUser = await User.findOne({ email: sanitizedEmail });

	// Hash password
	const hashedPassword = await bcryptjs.hash(password, 12); // Increased salt rounds for better security

	// Generate verification token
	const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

	let user;
	let isReRegistration = false;

	if (existingUser) {
		if (existingUser.isVerified) {
			// User exists and is verified - don't allow re-registration
			throw new ConflictError("User already exists and is verified. Please try logging in instead.");
		} else {
			// User exists but is not verified - allow re-registration
			isReRegistration = true;
			existingUser.password = hashedPassword;
			existingUser.name = sanitizedName;
			existingUser.role = role;
			existingUser.verificationToken = verificationToken;
			existingUser.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
			existingUser.createdAt = new Date(); // Update creation time for re-registration

			user = existingUser;
			await user.save();
		}
	} else {
		// Create new user
		user = new User({
			email: sanitizedEmail,
			password: hashedPassword,
			name: sanitizedName,
			role,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
		});

		await user.save();
	}

	// Generate JWT and set cookie
	generateTokenAndSetCookie(res, user._id, user.role);

	// Send verification email
	try {
		await sendVerificationEmail(user.email, verificationToken);
		if (isReRegistration) {
			console.log(`✅ Re-registration verification email sent to: ${user.email}`);
		}
	} catch (emailError) {
		console.error("Failed to send verification email:", emailError);
		// Don't fail the signup if email fails, but log it
	}

	const responseMessage = isReRegistration
		? "Account updated successfully. A new verification code has been sent to your email."
		: "User created successfully. Please check your email for verification code.";

	res.status(201).json({
		success: true,
		message: responseMessage,
		user: {
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
			isVerified: user.isVerified,
			createdAt: user.createdAt,
		},
	});
});

export const verifyEmail = asyncHandler(async (req, res) => {
	const { code } = req.body;

	// Validate verification code
	const codeValidation = validateVerificationCode(code);
	if (!codeValidation.isValid) {
		throw new ValidationError(codeValidation.message);
	}

	// Find user with valid verification token
	const user = await User.findOne({
		verificationToken: code,
		verificationTokenExpiresAt: { $gt: Date.now() },
	});

	if (!user) {
		throw new AuthenticationError("Invalid or expired verification code");
	}

	// Update user verification status
	user.isVerified = true;
	user.verificationToken = undefined;
	user.verificationTokenExpiresAt = undefined;
	await user.save();

	// Send welcome email
	try {
		await sendWelcomeEmail(user.email, user.name);
	} catch (emailError) {
		console.error("Failed to send welcome email:", emailError);
		// Don't fail the verification if welcome email fails
	}

	res.status(200).json({
		success: true,
		message: "Email verified successfully",
		user: {
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
			isVerified: user.isVerified,
			createdAt: user.createdAt,
		},
	});
});

export const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	// Validate input
	const emailValidation = validateEmail(email);
	if (!emailValidation.isValid) {
		throw new ValidationError(emailValidation.message);
	}

	if (!password) {
		throw new ValidationError("Password is required");
	}

	// Sanitize email
	const sanitizedEmail = sanitizeEmail(email);

	// Find user
	const user = await User.findOne({ email: sanitizedEmail });
	if (!user) {
		throw new AuthenticationError("Invalid credentials");
	}

	// Verify password
	const isPasswordValid = await bcryptjs.compare(password, user.password);
	if (!isPasswordValid) {
		throw new AuthenticationError("Invalid credentials");
	}

	// Generate JWT and set cookie
	generateTokenAndSetCookie(res, user._id, user.role);

	// Update last login
	user.lastLogin = new Date();
	await user.save();

	res.status(200).json({
		success: true,
		message: "Logged in successfully",
		user: {
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
			isVerified: user.isVerified,
			lastLogin: user.lastLogin,
			createdAt: user.createdAt,
		},
	});
});

export const logout = asyncHandler(async (req, res) => {
	res.clearCookie("token", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});

	res.status(200).json({
		success: true,
		message: "Logged out successfully"
	});
});

export const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;

	// Validate email
	const emailValidation = validateEmail(email);
	if (!emailValidation.isValid) {
		throw new ValidationError(emailValidation.message);
	}

	// Sanitize email
	const sanitizedEmail = sanitizeEmail(email);

	// Find user
	const user = await User.findOne({ email: sanitizedEmail });
	if (!user) {
		// Don't reveal if user exists or not for security
		return res.status(200).json({
			success: true,
			message: "If an account with that email exists, we've sent a password reset link"
		});
	}

	// Generate reset token
	const resetToken = crypto.randomBytes(20).toString("hex");
	const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

	user.resetPasswordToken = resetToken;
	user.resetPasswordExpiresAt = resetTokenExpiresAt;
	await user.save();

	// Send password reset email
	try {
		const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
		await sendPasswordResetEmail(user.email, resetURL);
	} catch (emailError) {
		console.error("Failed to send password reset email:", emailError);
		// Reset the token if email fails
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();
		throw new Error("Failed to send password reset email. Please try again.");
	}

	res.status(200).json({
		success: true,
		message: "Password reset link sent to your email"
	});
});

export const resetPassword = asyncHandler(async (req, res) => {
	const { token } = req.params;
	const { password } = req.body;

	// Validate reset token
	const tokenValidation = validateResetToken(token);
	if (!tokenValidation.isValid) {
		throw new ValidationError(tokenValidation.message);
	}

	// Validate new password
	const passwordValidation = validatePassword(password);
	if (!passwordValidation.isValid) {
		throw new ValidationError(passwordValidation.message);
	}

	// Find user with valid reset token
	const user = await User.findOne({
		resetPasswordToken: token,
		resetPasswordExpiresAt: { $gt: Date.now() },
	});

	if (!user) {
		throw new AuthenticationError("Invalid or expired reset token");
	}

	// Hash new password
	const hashedPassword = await bcryptjs.hash(password, 12);

	// Update user password and clear reset token
	user.password = hashedPassword;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpiresAt = undefined;
	await user.save();

	// Send success email
	try {
		await sendResetSuccessEmail(user.email);
	} catch (emailError) {
		console.error("Failed to send password reset success email:", emailError);
		// Don't fail the reset if email fails
	}

	res.status(200).json({
		success: true,
		message: "Password reset successful"
	});
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
	const { email } = req.body;

	// Validate email
	const emailValidation = validateEmail(email);
	if (!emailValidation.isValid) {
		throw new ValidationError(emailValidation.message);
	}

	// Sanitize email
	const sanitizedEmail = sanitizeEmail(email);

	// Find user
	const user = await User.findOne({ email: sanitizedEmail });
	if (!user) {
		throw new NotFoundError("User not found");
	}

	if (user.isVerified) {
		throw new ConflictError("Email is already verified");
	}

	// Generate new verification token
	const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
	user.verificationToken = verificationToken;
	user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
	await user.save();

	// Send verification email
	try {
		await sendVerificationEmail(user.email, verificationToken);
	} catch (emailError) {
		console.error("Failed to resend verification email:", emailError);
		throw new Error("Failed to send verification email. Please try again.");
	}

	res.status(200).json({
		success: true,
		message: "Verification email sent successfully"
	});
});

export const checkAuth = asyncHandler(async (req, res) => {
	const user = await User.findById(req.userId).select("-password");

	if (!user) {
		throw new NotFoundError("User not found");
	}

	res.status(200).json({
		success: true,
		user: {
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
			isVerified: user.isVerified,
			lastLogin: user.lastLogin,
			createdAt: user.createdAt,
		}
	});
});
