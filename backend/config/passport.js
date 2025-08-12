import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

// Configure Google OAuth strategy
console.log("🔍 Configuring Google OAuth strategy...");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing");
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing");

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔍 Google OAuth Profile:", profile);

        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log("✅ Existing Google user found:", user.email);
          return done(null, user);
        }

        // Check if user exists with the same email (local account)
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing local account
          console.log("🔗 Linking Google account to existing user:", user.email);
          user.googleId = profile.id;
          user.provider = "google";
          user.avatar = profile.photos[0]?.value;
          user.isVerified = true;
          await user.save();
          return done(null, user);
        }

        // Create new user with Google account
        console.log("➕ Creating new Google user:", profile.emails[0].value);
        
        // Determine role based on email domain or default to faculty
        let role = "faculty";
        const email = profile.emails[0].value;
        
        // You can customize this logic based on your requirements
        if (email.includes("admin") || email.includes("security")) {
          role = email.includes("admin") ? "admin" : "security";
        }

        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          provider: "google",
          avatar: profile.photos[0]?.value,
          role: role,
          isVerified: true,
        });

        await user.save();
        console.log("✅ New Google user created:", user.email);
        return done(null, user);
      } catch (error) {
        console.error("❌ Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);
} else {
  console.warn("⚠️ Google OAuth credentials not found. OAuth authentication will be disabled.");
  console.warn("Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file");
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
