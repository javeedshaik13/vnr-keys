import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

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
import about from "./routes/about.js"

dotenv.config();

const app = express();
const server = createServer(app);
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
		// Only log CORS details in development mode
		if (process.env.NODE_ENV === 'development') {
			console.log('CORS check - Origin:', origin);
		}

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

		if (allowedOrigins.includes(origin)) {
			if (process.env.NODE_ENV === 'development') {
				console.log('CORS: ALLOWED for', origin);
			}
			callback(null, true);
		} else {
			console.warn('CORS: BLOCKED for', origin);
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
			about : "/api/about",
			health: "/api/health",
			auth: "/api/auth",
			dashboard: "/api/dashboard",
			keys: "/api/keys"
		}
	});
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/keys", keyRoutes);
app.use("/api/about",about);

// Global error handler (must be after all routes)
app.use(globalErrorHandler);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// Configure Socket.IO with CORS
const io = new Server(server, {
	cors: {
		origin: [
			'https://vnr-keys.vercel.app',
			'http://localhost:5173',
			'http://localhost:3000',
			'http://127.0.0.1:5173'
		],
		methods: ["GET", "POST"],
		credentials: true
	}
});

// Socket.IO connection handling
io.on('connection', (socket) => {
	if (process.env.NODE_ENV === 'development') {
		console.log(`🔌 User connected: ${socket.id}`);
	}

	// Join user to their own room for personalized updates
	socket.on('join-user-room', (userId) => {
		socket.join(`user-${userId}`);
		if (process.env.NODE_ENV === 'development') {
			console.log(`👤 User ${userId} joined their room`);
		}
	});

	// Join all users to a general keys room for global updates
	socket.join('keys-updates');

	socket.on('disconnect', () => {
		if (process.env.NODE_ENV === 'development') {
			console.log(`🔌 User disconnected: ${socket.id}`);
		}
	});
});

// Make io available globally for other modules
global.io = io;

server.listen(PORT, async () => {
	await connectDB();
	await verifyTransporter();

	console.log(`🚀 VNR Keys Server running on port ${PORT}`);
	console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
	console.log("🔌 Socket.IO server ready for real-time updates");

	if (process.env.NODE_ENV === 'development') {
		console.log(`📱 Frontend URL: http://localhost:5173`);
		console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
	}
});
