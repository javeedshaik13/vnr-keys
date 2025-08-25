import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ["faculty", "security", "admin"],
        required: true,
      },
    },
    type: {
      type: String,
      enum: [
        "key_reminder", // 5PM reminder for unreturned keys
        "key_overdue", // Key not returned after deadline
        "key_taken", // Key taken notification
        "key_returned", // Key returned notification
        "system_alert", // General system alerts
        "security_alert", // Security-related alerts
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    // Metadata for different notification types
    metadata: {
      // For key-related notifications
      keyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Key",
        default: null,
      },
      keyNumber: {
        type: String,
        default: null,
      },
      keyName: {
        type: String,
        default: null,
      },
      location: {
        type: String,
        default: null,
      },
      // For key reminder notifications
      takenAt: {
        type: Date,
        default: null,
      },
      hoursOverdue: {
        type: Number,
        default: null,
      },
      // For security notifications
      securityLevel: {
        type: String,
        enum: ["info", "warning", "critical"],
        default: "info",
      },
      // Additional context data
      additionalData: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    // Delivery tracking
    delivery: {
      inApp: {
        sent: { type: Boolean, default: false },
        sentAt: { type: Date, default: null },
      },
      email: {
        sent: { type: Boolean, default: false },
        sentAt: { type: Date, default: null },
        error: { type: String, default: null },
      },
      realTime: {
        sent: { type: Boolean, default: false },
        sentAt: { type: Date, default: null },
      },
    },
    // Expiry and cleanup
    expiresAt: {
      type: Date,
      default: function() {
        // Notifications expire after 30 days by default
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true,
    collection: "notifications"
  }
);

// Indexes for better performance
notificationSchema.index({ "recipient.userId": 1, createdAt: -1 });
notificationSchema.index({ "recipient.role": 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
notificationSchema.index({ "metadata.keyId": 1 });
notificationSchema.index({ isActive: 1 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark notification as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = null;
  return this.save();
};

// Static method to find unread notifications for a user
notificationSchema.statics.findUnreadForUser = function(userId) {
  return this.find({ 
    "recipient.userId": userId, 
    isRead: false, 
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Static method to find all notifications for a user
notificationSchema.statics.findForUser = function(userId, options = {}) {
  const query = { 
    "recipient.userId": userId, 
    isActive: true,
    expiresAt: { $gt: new Date() }
  };
  
  if (options.isRead !== undefined) {
    query.isRead = options.isRead;
  }
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.priority) {
    query.priority = options.priority;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to count unread notifications for a user
notificationSchema.statics.countUnreadForUser = function(userId) {
  return this.countDocuments({ 
    "recipient.userId": userId, 
    isRead: false, 
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to find notifications by type
notificationSchema.statics.findByType = function(type, options = {}) {
  const query = { type, isActive: true };
  
  if (options.role) {
    query["recipient.role"] = options.role;
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to cleanup expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({ 
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false }
    ]
  });
};

export const Notification = mongoose.model("Notification", notificationSchema);
