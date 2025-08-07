import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId, role) => {
	const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});

	// Cookie configuration for production deployment
	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Changed to "none" for cross-origin in production
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	};

	// Add domain for production if needed
	if (process.env.NODE_ENV === "production") {
		// Don't set domain - let it default to the current domain
		// This allows cookies to work across subdomains if needed
	}

	console.log('🍪 Setting cookie with options:', cookieOptions);

	res.cookie("token", token, cookieOptions);

	return token;
};
