// Simple script to check environment variables
import dotenv from "dotenv";

dotenv.config();

console.log("=== Environment Variables Check ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("MONGO_URI:", process.env.MONGO_URI ? "Set" : "Not set");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");
console.log("=====================================");

// Test CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        console.log("CORS check - Origin:", origin);
        
        const allowedOrigins = process.env.NODE_ENV === "production"
            ? [process.env.CLIENT_URL, 'https://dev-keys.vjstartup.com']
            : ["http://localhost:5173", "http://localhost:3000","https://dev-keys.vjstartup.com", "http://127.0.0.1:5173"];
        
        console.log("Allowed origins:", allowedOrigins);
        
        if (!origin || allowedOrigins.includes(origin)) {
            console.log("CORS: ALLOWED");
            callback(null, true);
        } else {
            console.log("CORS: BLOCKED");
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Test with the actual origin
corsOptions.origin('https://dev-keys.vjstartup.com', (err, allowed) => {
    console.log("Test CORS for https://dev-keys.vjstartup.com:", allowed ? "ALLOWED" : "BLOCKED");
    if (err) console.log("Error:", err.message);
});
