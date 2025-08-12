import mongoose from "mongoose";

export const connectDB = async () => {
	try {
		// Only log URI in development mode for security
		if (process.env.NODE_ENV === 'development') {
			console.log("🔄 Connecting to MongoDB...");
		}

		const conn = await mongoose.connect(process.env.MONGO_URI);
		console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error("❌ Error connecting to MongoDB:", error.message);
		process.exit(1);
	}
};
