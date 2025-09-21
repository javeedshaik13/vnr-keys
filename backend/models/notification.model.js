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

    type: {
      type: String,
      enum: ["key_reminder", "key_returned", "security_alert", "system", "general"],
      default: "general",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Auto-delete after 7 days (extended from 1 day)
    expiresAt: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      }
    },

    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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
notificationSchema.index({ read: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion



// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark notification as unread
notificationSchema.methods.markAsUnread = function() {
  this.read = false;
  this.readAt = null;
  return this.save();
};

// Static method to find unread notifications for a user
notificationSchema.statics.findUnreadForUser = function(userId) {
  return this.find({
    "recipient.userId": userId,
    read: false,
    isActive: true
  }).sort({ createdAt: -1 });
};

// Static method to find all notifications for a user
notificationSchema.statics.findForUser = function(userId, options = {}) {
  const query = {
    "recipient.userId": userId,
    isActive: true
  };

  if (options.read !== undefined) {
    query.read = options.read;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to count unread notifications for a user
notificationSchema.statics.countUnreadForUser = function(userId) {
  return this.countDocuments({
    "recipient.userId": userId,
    read: false,
    isActive: true
  });
};

// Static method to clean up expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false }
    ]
  });
};

// Static method to deactivate notification instead of deleting
notificationSchema.statics.deactivateNotification = function(notificationId) {
  return this.findByIdAndUpdate(
    notificationId,
    { isActive: false },
    { new: true }
  );
};



export const Notification = mongoose.model("Notification", notificationSchema);
