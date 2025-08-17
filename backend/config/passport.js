import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

// Configure Google OAuth strategy
console.log("🔍 Configuring Google OAuth strategy...");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing");
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing");

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Determine callback URL based on environment
  const callbackURL = 'https://dev-keys.vjstartup.com/be/api/auth/google/callback';

  console.log("🔗 OAuth callback URL:", callbackURL);

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
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

        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // User exists with same email - link Google account to existing user
          console.log("🔗 Linking Google account to existing user:", user.email);

          // Update existing user with Google ID and provider info
          user.googleId = profile.id;
          user.provider = "google";
          user.avatar = profile.photos[0]?.value || user.avatar;
          user.lastLogin = new Date();

          await user.save();
          console.log("✅ Google account linked to existing user:", user.email);
          return done(null, user);
        }

        // Create new user with Google account (incomplete registration)
        console.log("➕ Creating new Google user:", profile.emails[0].value);

        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          provider: "google",
          avatar: profile.photos[0]?.value,
          role: "pending", // Pending role - user needs to complete registration
          isVerified: true,
          lastLogin: new Date(),
        });

        await user.save();
        console.log("✅ New Google user created (needs registration):", user.email);
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
