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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Security middleware
app.use(helmetConfig);
app.use(requestLogger);
app.use(generalLimiter);
app.use(sanitizeRequest);

// CORS configuration
const corsOptions = {
	origin: process.env.NODE_ENV === "production"
		? process.env.CLIENT_URL
		: "http://localhost:5173",
	credentials: true,
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Limit request size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

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
