import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
	const token = req.cookies.token;

	// Log token verification attempts for debugging
	console.log(`[${req.method}] ${req.url} - Token: ${token ? 'Present' : 'Missing'}`);

	if (!token) {
		console.log('❌ No token found in cookies');
		return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) {
			console.log('❌ Token decoded but empty');
			return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });
		}

		req.userId = decoded.userId;
		req.userRole = decoded.role;
		console.log(`✅ Token verified for user: ${decoded.userId} (${decoded.role})`);
		next();
	} catch (error) {
		console.log("❌ Token verification error:", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
	}
};
