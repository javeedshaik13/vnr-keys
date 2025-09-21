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

    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    // Auto-delete after 1 day
    expiresAt: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
      }
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
    read: false
  }).sort({ createdAt: -1 });
};

// Static method to find all notifications for a user
notificationSchema.statics.findForUser = function(userId, options = {}) {
  const query = {
    "recipient.userId": userId
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
    read: false
  });
};



export const Notification = mongoose.model("Notification", notificationSchema);
