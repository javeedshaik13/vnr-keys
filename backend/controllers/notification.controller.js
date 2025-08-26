import { asyncHandler } from "../utils/errorHandler.js";
import { ValidationError, NotFoundError } from "../utils/errorHandler.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  createAndSendNotification,
  checkAndSendKeyReminders,
  cleanupExpiredNotifications
} from "../services/notificationService.js";
import { Notification } from "../models/notification.model.js";

/**
 * Get all notifications for the current user
 */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;
  const userId = req.userId;

  const options = {
    limit: parseInt(limit),
    isRead: isRead !== undefined ? isRead === 'true' : undefined
  };

  const notifications = await getUserNotifications(userId, options);
  const unreadCount = await getUnreadNotificationCount(userId);

  res.status(200).json({
    success: true,
    message: "Notifications retrieved successfully",
    data: {
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: notifications.length
      }
    }
  });
});

/**
 * Get unread notification count for the current user
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const unreadCount = await getUnreadNotificationCount(userId);

  res.status(200).json({
    success: true,
    message: "Unread count retrieved successfully",
    data: { unreadCount }
  });
});

/**
 * Mark a notification as read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.userId;

  if (!notificationId) {
    throw new ValidationError("Notification ID is required");
  }

  const notification = await markNotificationAsRead(notificationId, userId);

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: { notification }
  });
});

/**
 * Mark a notification as unread
 */
export const markAsUnread = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.userId;

  if (!notificationId) {
    throw new ValidationError("Notification ID is required");
  }

  // Find and update the notification
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      'recipient.userId': userId
    },
    {
      isRead: false,
      readAt: null
    },
    { new: true }
  );

  if (!notification) {
    throw new NotFoundError("Notification not found");
  }

  res.status(200).json({
    success: true,
    message: "Notification marked as unread",
    data: { notification }
  });
});

/**
 * Mark multiple notifications as read
 */
export const markMultipleAsRead = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;
  const userId = req.userId;

  if (!notificationIds || !Array.isArray(notificationIds)) {
    throw new ValidationError("Notification IDs array is required");
  }

  const updatedNotifications = [];
  
  for (const notificationId of notificationIds) {
    try {
      const notification = await markNotificationAsRead(notificationId, userId);
      updatedNotifications.push(notification);
    } catch (error) {
      console.warn(`Failed to mark notification ${notificationId} as read:`, error.message);
    }
  }

  res.status(200).json({
    success: true,
    message: `${updatedNotifications.length} notifications marked as read`,
    data: { updatedNotifications }
  });
});

/**
 * Mark all notifications as read for the current user
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const result = await Notification.updateMany(
    { 
      'recipient.userId': userId, 
      isRead: false,
      isActive: true 
    },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} notifications marked as read`,
    data: { modifiedCount: result.modifiedCount }
  });
});

/**
 * Delete a notification (soft delete by marking as inactive)
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.userId;

  if (!notificationId) {
    throw new ValidationError("Notification ID is required");
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    'recipient.userId': userId
  });

  if (!notification) {
    throw new NotFoundError("Notification not found");
  }

  notification.isActive = false;
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully"
  });
});



/**
 * Trigger key reminders manually (admin only)
 */
export const triggerKeyReminders = asyncHandler(async (req, res) => {
  const result = await checkAndSendKeyReminders();

  res.status(200).json({
    success: true,
    message: "Key reminders triggered successfully",
    data: result
  });
});

/**
 * Get notification statistics (admin only)
 */
export const getNotificationStats = asyncHandler(async (req, res) => {
  const stats = await Notification.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        unreadNotifications: {
          $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] }
        },
        notificationsByType: {
          $push: {
            type: "$type",
            count: 1
          }
        },
        notificationsByPriority: {
          $push: {
            priority: "$priority",
            count: 1
          }
        }
      }
    }
  ]);

  const typeStats = await Notification.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$type", count: { $sum: 1 } } }
  ]);

  const priorityStats = await Notification.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$priority", count: { $sum: 1 } } }
  ]);

  const roleStats = await Notification.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$recipient.role", count: { $sum: 1 } } }
  ]);

  res.status(200).json({
    success: true,
    message: "Notification statistics retrieved successfully",
    data: {
      overview: stats[0] || {
        totalNotifications: 0,
        unreadNotifications: 0
      },
      byType: typeStats,
      byPriority: priorityStats,
      byRole: roleStats
    }
  });
});

/**
 * Cleanup expired notifications (admin only)
 */
export const cleanupNotifications = asyncHandler(async (req, res) => {
  const result = await cleanupExpiredNotifications();

  res.status(200).json({
    success: true,
    message: "Notification cleanup completed",
    data: { deletedCount: result.deletedCount }
  });
});

/**
 * Get notification by ID
 */
export const getNotificationById = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.userId;

  if (!notificationId) {
    throw new ValidationError("Notification ID is required");
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    'recipient.userId': userId,
    isActive: true
  });

  if (!notification) {
    throw new NotFoundError("Notification not found");
  }

  res.status(200).json({
    success: true,
    message: "Notification retrieved successfully",
    data: { notification }
  });
});
