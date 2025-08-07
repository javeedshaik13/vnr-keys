import rateLimit from "express-rate-limit";
import helmet from "helmet";

// General rate limiting
export const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: {
		success: false,
		message: "Too many requests from this IP, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Strict rate limiting for auth endpoints
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 auth requests per windowMs
	message: {
		success: false,
		message: "Too many authentication attempts, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true, // Don't count successful requests
});

// Very strict rate limiting for password reset
export const passwordResetLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 3, // Limit each IP to 3 password reset requests per hour
	message: {
		success: false,
		message: "Too many password reset attempts, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Email verification rate limiting
export const emailVerificationLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 3, // Limit each IP to 3 verification attempts per 5 minutes
	message: {
		success: false,
		message: "Too many verification attempts, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Helmet configuration for security headers
export const helmetConfig = helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			scriptSrc: ["'self'"],
			imgSrc: ["'self'", "data:", "https:"],
			connectSrc: ["'self'"],
			fontSrc: ["'self'"],
			objectSrc: ["'none'"],
			mediaSrc: ["'self'"],
			frameSrc: ["'none'"],
		},
	},
	crossOriginEmbedderPolicy: false, // Disable for development
});

// Request sanitization middleware
export const sanitizeRequest = (req, res, next) => {
	// Remove any potential XSS characters from request body
	if (req.body) {
		for (const key in req.body) {
			if (typeof req.body[key] === 'string') {
				// Basic XSS prevention
				req.body[key] = req.body[key]
					.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
					.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
					.replace(/javascript:/gi, '')
					.replace(/on\w+\s*=/gi, '');
			}
		}
	}
	
	// Remove potential XSS from query parameters
	if (req.query) {
		for (const key in req.query) {
			if (typeof req.query[key] === 'string') {
				req.query[key] = req.query[key]
					.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
					.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
					.replace(/javascript:/gi, '')
					.replace(/on\w+\s*=/gi, '');
			}
		}
	}
	
	next();
};

// IP whitelist middleware (for development/testing)
export const ipWhitelist = (whitelist = []) => {
	return (req, res, next) => {
		if (process.env.NODE_ENV === 'production' && whitelist.length > 0) {
			const clientIP = req.ip || req.connection.remoteAddress;
			if (!whitelist.includes(clientIP)) {
				return res.status(403).json({
					success: false,
					message: 'Access denied from this IP address',
				});
			}
		}
		next();
	};
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
	const start = Date.now();
	
	res.on('finish', () => {
		const duration = Date.now() - start;
		const logData = {
			method: req.method,
			url: req.url,
			status: res.statusCode,
			duration: `${duration}ms`,
			ip: req.ip,
			userAgent: req.get('User-Agent'),
			timestamp: new Date().toISOString(),
		};
		
		// Log errors and slow requests
		if (res.statusCode >= 400 || duration > 1000) {
			console.warn('Request log:', logData);
		} else if (process.env.NODE_ENV === 'development') {
			console.log('Request log:', logData);
		}
	});
	
	next();
};
