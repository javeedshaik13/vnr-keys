import mongoose from "mongoose";
import crypto from "crypto";

const apiKeySchema = new mongoose.Schema(
  {
    keyId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    keyName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: [
        "CSE", // Computer Science Engineering
        "EEE", // Electrical and Electronics Engineering
        "AIML", // Artificial Intelligence and Machine Learning
        "IoT", // Internet of Things
        "ECE", // Electronics and Communication Engineering
        "MECH", // Mechanical Engineering
        "CIVIL", // Civil Engineering
        "IT", // Information Technology
        "ADMIN", // Administration
        "RESEARCH" // Research Department
      ],
      trim: true,
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isStatic: {
      type: Boolean,
      default: true, // Static keys are hardcoded/seeded keys that can be deleted by admin
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastUsed: {
      type: Date,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    permissions: {
      read: {
        type: Boolean,
        default: true,
      },
      write: {
        type: Boolean,
        default: false,
      },
      delete: {
        type: Boolean,
        default: false,
      },
    },
    expiresAt: {
      type: Date,
      default: null, // null means no expiration
    },
    rateLimit: {
      requestsPerMinute: {
        type: Number,
        default: 100,
      },
      requestsPerHour: {
        type: Number,
        default: 1000,
      },
    },
  },
  { 
    timestamps: true,
    collection: "apikeys"
  }
);

// Indexes for better performance
apiKeySchema.index({ keyId: 1 });
apiKeySchema.index({ department: 1 });
apiKeySchema.index({ apiKey: 1 });
apiKeySchema.index({ isActive: 1 });
apiKeySchema.index({ createdBy: 1 });
apiKeySchema.index({ expiresAt: 1 });

// Virtual for checking if key is expired
apiKeySchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Static method to generate a secure API key
apiKeySchema.statics.generateApiKey = function(department, keyId) {
  const prefix = department.toLowerCase();
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `${prefix}_${keyId}_${timestamp}_${randomBytes}`;
};

// Static method to find active keys by department
apiKeySchema.statics.findByDepartment = function(department) {
  return this.find({ 
    department, 
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Static method to find all active keys (admin access)
apiKeySchema.statics.findAllActive = function() {
  return this.find({ 
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  }).populate('createdBy', 'name email role');
};

// Method to update usage statistics
apiKeySchema.methods.recordUsage = function() {
  this.lastUsed = new Date();
  this.usageCount += 1;
  return this.save();
};

// Method to deactivate key
apiKeySchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Method to activate key
apiKeySchema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

// Pre-save middleware to ensure API key is generated
apiKeySchema.pre('save', function(next) {
  if (this.isNew && !this.apiKey) {
    const prefix = this.department.toLowerCase();
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.randomBytes(16).toString('hex');
    this.apiKey = `${prefix}_${this.keyId}_${timestamp}_${randomBytes}`;
  }
  next();
});

export const ApiKey = mongoose.model("ApiKey", apiKeySchema);
