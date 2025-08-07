import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import { ApiKey } from "../models/apiKey.model.js";
import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";

dotenv.config();

/**
 * Generate a secure API key
 */
const generateApiKey = (department, keyId) => {
  const prefix = department.toLowerCase();
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `${prefix}_${keyId}_${timestamp}_${randomBytes}`;
};

// Department API Keys Seed Data (converted from TypeScript)
const departmentApiKeys = [
  {
    keyId: "CSE_001",
    keyName: "Computer Science Engineering - Primary Key",
    department: "CSE",
    description: "Primary API key for Computer Science Engineering department operations, research projects, and student management systems",
    permissions: {
      read: true,
      write: true,
      delete: false,
    },
    rateLimit: {
      requestsPerMinute: 200,
      requestsPerHour: 5000,
    },
    isStatic: true,
  },
  {
    keyId: "EEE_001",
    keyName: "Electrical & Electronics Engineering - Primary Key",
    department: "EEE",
    description: "Primary API key for Electrical and Electronics Engineering department for lab management and project coordination",
    permissions: {
      read: true,
      write: true,
      delete: false,
    },
    rateLimit: {
      requestsPerMinute: 150,
      requestsPerHour: 3000,
    },
    isStatic: true,
  },
  {
    keyId: "AIML_001",
    keyName: "AI & Machine Learning - Research Key",
    department: "AIML",
    description: "API key for Artificial Intelligence and Machine Learning department research activities and model training systems",
    permissions: {
      read: true,
      write: true,
      delete: true,
    },
    rateLimit: {
      requestsPerMinute: 300,
      requestsPerHour: 8000,
    },
    isStatic: true,
  },
  {
    keyId: "IOT_001",
    keyName: "Internet of Things - Device Management Key",
    department: "IoT",
    description: "API key for IoT department device management, sensor data collection, and smart campus initiatives",
    permissions: {
      read: true,
      write: true,
      delete: false,
    },
    rateLimit: {
      requestsPerMinute: 500,
      requestsPerHour: 10000,
    },
    isStatic: true,
  },
  {
    keyId: "ECE_001",
    keyName: "Electronics & Communication - Primary Key",
    department: "ECE",
    description: "Primary API key for Electronics and Communication Engineering department lab equipment and project management",
    permissions: {
      read: true,
      write: true,
      delete: false,
    },
    rateLimit: {
      requestsPerMinute: 150,
      requestsPerHour: 3500,
    },
    isStatic: true,
  },
  {
    keyId: "MECH_001",
    keyName: "Mechanical Engineering - Workshop Key",
    department: "MECH",
    description: "API key for Mechanical Engineering department workshop management and CAD system integration",
    permissions: {
      read: true,
      write: true,
      delete: false,
    },
    rateLimit: {
      requestsPerMinute: 100,
      requestsPerHour: 2000,
    },
    isStatic: true,
  },
  {
    keyId: "CIVIL_001",
    keyName: "Civil Engineering - Project Management Key",
    department: "CIVIL",
    description: "API key for Civil Engineering department project management, surveying tools, and construction management systems",
    permissions: {
      read: true,
      write: true,
      delete: false,
    },
    rateLimit: {
      requestsPerMinute: 120,
      requestsPerHour: 2500,
    },
    isStatic: true,
  },
  {
    keyId: "IT_001",
    keyName: "Information Technology - Infrastructure Key",
    department: "IT",
    description: "API key for IT department infrastructure management, network monitoring, and system administration",
    permissions: {
      read: true,
      write: true,
      delete: true,
    },
    rateLimit: {
      requestsPerMinute: 400,
      requestsPerHour: 12000,
    },
    isStatic: true,
  },
  {
    keyId: "ADMIN_001",
    keyName: "Administration - Management Key",
    department: "ADMIN",
    description: "API key for Administration department student records, faculty management, and institutional operations",
    permissions: {
      read: true,
      write: true,
      delete: true,
    },
    rateLimit: {
      requestsPerMinute: 250,
      requestsPerHour: 6000,
    },
    isStatic: true,
  },
  {
    keyId: "RESEARCH_001",
    keyName: "Research Department - Analytics Key",
    department: "RESEARCH",
    description: "API key for Research department data analytics, publication management, and collaborative research platforms",
    permissions: {
      read: true,
      write: true,
      delete: false,
    },
    rateLimit: {
      requestsPerMinute: 200,
      requestsPerHour: 4000,
    },
    isStatic: true,
  },
];

/**
 * Ensure admin user exists for API key management
 */
const ensureAdminUser = async () => {
  try {
    console.log("🔍 Checking for admin user...");
    
    let adminUser = await User.findOne({ role: "admin" });
    
    if (!adminUser) {
      console.log("👤 Creating default admin user...");
      
      const hashedPassword = await bcryptjs.hash("admin123", 12);
      
      adminUser = new User({
        email: "admin@vnr.edu.in",
        password: hashedPassword,
        name: "System Administrator",
        role: "admin",
        isVerified: true,
      });
      
      await adminUser.save();
      console.log("✅ Default admin user created successfully");
      console.log("📧 Email: admin@vnr.edu.in");
      console.log("🔑 Password: admin123");
      console.log("⚠️  Please change the default password after first login!");
    } else {
      console.log("✅ Admin user already exists");
    }
    
    return adminUser;
  } catch (error) {
    console.error("❌ Error ensuring admin user:", error.message);
    throw error;
  }
};

/**
 * Import API keys into the database
 */
const importApiKeys = async () => {
  try {
    console.log("🚀 Starting API Keys Import Process...");
    console.log("=" .repeat(50));
    
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB successfully");
    
    // Ensure admin user exists
    const adminUser = await ensureAdminUser();
    
    // Clear existing API keys
    console.log("\n🧹 Clearing existing API keys...");
    const deletedCount = await ApiKey.deleteMany({});
    console.log(`✅ Cleared ${deletedCount.deletedCount} existing API keys`);
    
    // Insert new API keys
    console.log("\n📝 Inserting department API keys...");
    const insertedKeys = [];

    for (const keyData of departmentApiKeys) {
      const apiKey = new ApiKey({
        ...keyData,
        apiKey: generateApiKey(keyData.department, keyData.keyId),
        createdBy: adminUser._id,
      });

      const savedKey = await apiKey.save();
      insertedKeys.push(savedKey);
      console.log(`✅ Created key: ${savedKey.keyId} for ${savedKey.department}`);
    }

    console.log(`✅ Successfully inserted ${insertedKeys.length} API keys`);
    
    // Display inserted keys
    console.log("\n📋 Inserted API Keys Summary:");
    console.log("-" .repeat(80));
    insertedKeys.forEach((key, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${key.keyId.padEnd(12)} | ${key.department.padEnd(8)} | ${key.keyName}`);
      console.log(`    🔑 API Key: ${key.apiKey.substring(0, 20)}...`);
      console.log(`    📊 Rate Limit: ${key.rateLimit.requestsPerMinute}/min, ${key.rateLimit.requestsPerHour}/hour`);
      console.log(`    🔐 Permissions: R:${key.permissions.read} W:${key.permissions.write} D:${key.permissions.delete}`);
      console.log("");
    });
    
    // Validate keys
    console.log("🔍 Validating inserted keys...");
    const validationResults = await Promise.all(
      insertedKeys.map(async (key) => {
        const foundKey = await ApiKey.findById(key._id);
        return {
          keyId: key.keyId,
          valid: !!foundKey && foundKey.isActive,
          department: foundKey?.department,
        };
      })
    );
    
    const validKeys = validationResults.filter(result => result.valid);
    const invalidKeys = validationResults.filter(result => !result.valid);
    
    console.log(`✅ Validation complete: ${validKeys.length} valid, ${invalidKeys.length} invalid`);
    
    if (invalidKeys.length > 0) {
      console.log("⚠️  Invalid keys found:");
      invalidKeys.forEach(key => console.log(`   - ${key.keyId}`));
    }
    
    // Summary
    console.log("\n" + "=" .repeat(50));
    console.log("🎉 API Keys Import Summary:");
    console.log(`   📊 Total Keys Imported: ${insertedKeys.length}`);
    console.log(`   🏢 Departments Covered: ${[...new Set(insertedKeys.map(k => k.department))].length}`);
    console.log(`   👤 Admin User: ${adminUser.email}`);
    console.log(`   🔐 All keys are accessible by admin users`);
    console.log("=" .repeat(50));
    
    console.log("\n✅ API Keys import completed successfully!");
    console.log("\n🚀 You can now use the following command to start the server:");
    console.log("   npm run dev");
    console.log("\n📚 API Endpoints available at:");
    console.log("   GET    /api/api-keys              - Get all API keys (admin)");
    console.log("   GET    /api/api-keys/stats        - Get API key statistics (admin)");
    console.log("   GET    /api/api-keys/department/:dept - Get keys by department");
    console.log("   POST   /api/api-keys              - Create new API key (admin)");
    console.log("   PUT    /api/api-keys/:keyId       - Update API key (admin)");
    console.log("   DELETE /api/api-keys/:keyId       - Delete static API key (admin)");
    
  } catch (error) {
    console.error("❌ Error importing API keys:", error.message);
    if (error.code === 11000) {
      console.error("💡 Duplicate key error - some keys may already exist");
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the import function
importApiKeys();
