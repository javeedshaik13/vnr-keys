import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./db/connectDB.js";
import { verifyTransporter } from "./nodemailer/nodemailer.config.js";
import { globalErrorHandler } from "./utils/errorHandler.js";
import {
	generalLimiter,
	helmetConfig,
	sanitizeRequest,
	requestLogger
} from "./middleware/security.js";

import authRoutes from "./routes/auth.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import keyRoutes from "./routes/key.route.js";
import apiKeyRoutes from "./routes/apiKey.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(requestLogger);
app.use(generalLimiter);
app.use(sanitizeRequest);

// CORS configuration
const corsOptions = {
	origin: function (origin, callback) {
		console.log('CORS check - Origin:', origin);
		console.log('NODE_ENV:', process.env.NODE_ENV);
		console.log('CLIENT_URL:', process.env.CLIENT_URL);

		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);

		// Define allowed origins based on environment
		const allowedOrigins = [
			'https://vnr-keys.vercel.app',
			'http://localhost:5173',
			'http://localhost:3000',
			'http://127.0.0.1:5173'
		];

		// Add CLIENT_URL from environment if it exists
		if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
			allowedOrigins.push(process.env.CLIENT_URL);
		}

		console.log('Allowed origins:', allowedOrigins);

		if (allowedOrigins.includes(origin)) {
			console.log('CORS: ALLOWED for', origin);
			callback(null, true);
		} else {
			console.log('CORS: BLOCKED for', origin);
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true, // This is crucial for cookies to work cross-origin
	optionsSuccessStatus: 200,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: [
		'Content-Type',
		'Authorization',
		'X-Requested-With',
		'Accept',
		'Origin',
		'Access-Control-Request-Method',
		'Access-Control-Request-Headers'
	],
	exposedHeaders: ['Set-Cookie'], // Expose Set-Cookie header
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Limit request size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get("/api/health", (req, res) => {
	res.json({
		success: true,
		message: "Server is running",
		timestamp: new Date().toISOString(),
		env: process.env.NODE_ENV,
		cors: {
			origin: req.headers.origin,
			allowedOrigins: [
				'https://vnr-keys.vercel.app',
				'http://localhost:5173',
				'http://localhost:3000',
				'http://127.0.0.1:5173'
			]
		}
	});
});

// Root endpoint
app.get("/", (req, res) => {
	res.json({
		success: true,
		message: "VNR Keys API Server",
		version: "1.0.0",
		endpoints: {
			health: "/api/health",
			auth: "/api/auth",
			dashboard: "/api/dashboard",
			keys: "/api/keys",
			apiKeys: "/api/api-keys"
		}
	});
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/keys", keyRoutes);
app.use("/api/api-keys", apiKeyRoutes);

// Global error handler (must be after all routes)
app.use(globalErrorHandler);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, async () => {
	await connectDB();
	await verifyTransporter();
	console.log("Server is running on port: ", PORT);
});
