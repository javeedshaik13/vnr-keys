import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { Key } from "../models/key.model.js";
import { sendNotificationEmail } from "../nodemailer/emails.js";

/**
 * Notification Service
 * Handles creation, delivery, and management of notifications
 */

/**
 * Create a new notification
 * @param {Object} notificationData - The notification data
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();

    console.log(`📢 Notification created: ${notification.title} for user ${notification.recipient.name}`);
    return notification;
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    throw error;
  }
};

/**
 * Send real-time notification via Socket.IO
 * @param {Object} notification - The notification object
 */
export const sendRealTimeNotification = async (notification) => {
  try {
    if (!global.io) {
      console.warn('Socket.IO not initialized, skipping real-time notification');
      return;
    }

    const notificationData = {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
      read: notification.read
    };

    // Send to specific user
    global.io.to(`user-${notification.recipient.userId}`).emit('notification', notificationData);

    // Send to role-based rooms (for security notifications)
    if (notification.recipient.role === 'security') {
      global.io.to('security-room').emit('notification', notificationData);
    }
    
    console.log(`🔄 Real-time notification sent to user ${notification.recipient.name}`);
  } catch (error) {
    console.error("❌ Error sending real-time notification:", error);
  }
};

/**
 * Send email notification
 * @param {Object} notification - The notification object
 */
export const sendEmailNotification = async (notification) => {
  try {
    await sendNotificationEmail(
      notification.recipient.email,
      notification.recipient.name,
      notification.title,
      notification.message
    );

    console.log(`📧 Email notification sent to ${notification.recipient.email}`);
  } catch (error) {
    console.error("❌ Error sending email notification:", error);
  }
};

/**
 * Create notification when faculty takes a key
 * @param {Object} key - The taken key
 * @param {Object} faculty - The faculty who took the key
 */
export const createKeyTakenNotification = async (key, faculty) => {
  try {
    const notificationData = {
      recipient: {
        userId: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
      },
      title: 'Key Taken',
      message: `You have taken the key for ${key.keyName}`,
      type: 'key_taken',
      priority: 'low',
      metadata: {
        keyId: key._id,
        keyNumber: key.keyNumber,
        keyName: key.keyName,
      }
    };

    return await createAndSendNotification(notificationData, { email: false });
  } catch (error) {
    console.error("❌ Error creating key taken notification:", error);
    throw error;
  }
};

/**
 * Create notification when faculty returns a key themselves
 * @param {Object} key - The returned key
 * @param {Object} faculty - The faculty who returned the key
 */
export const createKeySelfReturnedNotification = async (key, faculty) => {
  try {
    const notificationData = {
      recipient: {
        userId: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
      },
      title: 'Key Returned',
      message: `You have returned key successfully ${key.keyName}`,
      type: 'key_self_returned',
      priority: 'low',
      metadata: {
        keyId: key._id,
        keyNumber: key.keyNumber,
        keyName: key.keyName,
      }
    };

    return await createAndSendNotification(notificationData, { email: false });
  } catch (error) {
    console.error("❌ Error creating key self-returned notification:", error);
    throw error;
  }
};

/**
 * Create notification for unreturned key after 5 PM
 * @param {Object} key - The unreturned key
 * @param {Object} faculty - The faculty who has the key
 */
export const createKeyPendingReturnNotification = async (key, faculty) => {
  try {
    const notificationData = {
      recipient: {
        userId: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
      },
      title: 'Key Return Pending',
      message: `You have not returned the key ${key.keyName} yet make sure inform to security office.`,
      type: 'key_pending_return',
      priority: 'high',
      metadata: {
        keyId: key._id,
        keyNumber: key.keyNumber,
        keyName: key.keyName,
      }
    };

    return await createAndSendNotification(notificationData, { email: true });
  } catch (error) {
    console.error("❌ Error creating key pending return notification:", error);
    throw error;
  }
};

/**
 * Create and send a complete notification (in-app + real-time + email)
 * @param {Object} notificationData - The notification data
 * @param {Object} options - Delivery options
 * @returns {Promise<Object>} Created notification
 */
export const createAndSendNotification = async (notificationData, options = {}) => {
  try {
    // Create the notification
    const notification = await createNotification(notificationData);
    
    // Send real-time notification
    if (options.realTime !== false) {
      await sendRealTimeNotification(notification);
    }
    
    // Send email notification only if explicitly enabled
    if (options.email === true) {
      await sendEmailNotification(notification);
    }
    
    return notification;
  } catch (error) {
    console.error("❌ Error creating and sending notification:", error);
    throw error;
  }
};

/**
 * Create key reminder notification for faculty
 * @param {Object} user - The faculty user
 * @param {Array} unreturnedKeys - Array of unreturned keys
 */
export const createKeyReminderNotification = async (user, unreturnedKeys) => {
  try {
    const keyCount = unreturnedKeys.length;
    const keyList = unreturnedKeys.map(key => `${key.keyNumber} (${key.keyName})`).join(', ');
    
    const notificationData = {
      recipient: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      title: `Key Return Reminder - ${keyCount} Key${keyCount > 1 ? 's' : ''} Pending`,
      message: `You have ${keyCount} unreturned key${keyCount > 1 ? 's' : ''}: ${keyList}. Please return ${keyCount > 1 ? 'them' : 'it'} as soon as possible.`,
      type: 'key_reminder',
      priority: 'high',
      metadata: {
        keyCount,
        keyIds: unreturnedKeys.map(key => key._id),
        reminderType: 'daily_5pm'
      }
    };
    
    return await createAndSendNotification(notificationData, { email: true });
  } catch (error) {
    console.error("❌ Error creating key reminder notification:", error);
    throw error;
  }
};

/**
 * Create security alert notification for watchman (in-app only, no email)
 * @param {Object} facultyUser - The faculty user with unreturned keys
 * @param {Array} unreturnedKeys - Array of unreturned keys
 */
export const createSecurityAlertNotification = async (facultyUser, unreturnedKeys) => {
  try {
    // Get all security users
    const securityUsers = await User.find({ role: 'security', isVerified: true });

    if (securityUsers.length === 0) {
      console.warn('No security users found to send alert');
      return [];
    }

    const keyCount = unreturnedKeys.length;
    const keyList = unreturnedKeys.map(key => `${key.keyNumber} (${key.keyName})`).join(', ');

    const notifications = [];

    for (const securityUser of securityUsers) {
      const notificationData = {
        recipient: {
          userId: securityUser._id,
          name: securityUser.name,
          email: securityUser.email,
          role: securityUser.role,
        },
        title: `Unreturned Keys Alert`,
        message: `Faculty ${facultyUser.name} has ${keyCount} unreturned key${keyCount > 1 ? 's' : ''}: ${keyList}. Please follow up for key return.`,
        type: 'security_alert',
        priority: 'medium',
        metadata: {
          facultyId: facultyUser._id,
          facultyName: facultyUser.name,
          keyCount,
          keyIds: unreturnedKeys.map(key => key._id)
        }
      };

      // Create notification but do NOT send email to security (email: false)
      const notification = await createAndSendNotification(notificationData, {
        email: false,  // No email for security
        realTime: true // Only in-app notification
      });
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error("❌ Error creating security alert notification:", error);
    throw error;
  }
};

/**
 * Create notification when a key assigned to faculty is returned by someone else
 * @param {Object} key - The returned key
 * @param {Object} originalFaculty - The faculty who originally took the key
 * @param {Object} returnedBy - The user who returned the key
 */
export const createKeyReturnedNotification = async (key, originalFaculty, returnedBy) => {
  try {
    const notificationData = {
      recipient: {
        userId: originalFaculty._id,
        name: originalFaculty.name,
        email: originalFaculty.email,
        role: originalFaculty.role,
      },
      title: `Key Returned`,
      message: `Key ${key.keyNumber} (${key.keyName}) that was assigned to you has been returned by ${returnedBy.name}.`,
      type: 'key_returned',
      priority: 'low',
      metadata: {
        keyId: key._id,
        keyNumber: key.keyNumber,
        keyName: key.keyName,
        returnedById: returnedBy._id,
        returnedByName: returnedBy.name
      }
    };

    return await createAndSendNotification(notificationData, { email: false });
  } catch (error) {
    console.error("❌ Error creating key returned notification:", error);
    throw error;
  }
};

/**
 * Check for unreturned keys and send 5PM reminders
 * This function is called by the scheduled job
 */
export const checkAndSendKeyReminders = async () => {
  try {
    console.log('🔍 Checking for unreturned keys at 5:00 PM...');
    
    // Find all unreturned keys
    const unreturnedKeys = await Key.find({ 
      status: 'unavailable',
      'takenBy.userId': { $ne: null },
      isActive: true
    }).populate('takenBy.userId');
    
    if (unreturnedKeys.length === 0) {
      console.log('✅ No unreturned keys found');
      return { facultyNotifications: 0, securityNotifications: 0 };
    }
    
    // Group keys by faculty user
    const keysByFaculty = {};
    
    for (const key of unreturnedKeys) {
      const userId = key.takenBy.userId.toString();
      if (!keysByFaculty[userId]) {
        keysByFaculty[userId] = {
          user: key.takenBy.userId,
          keys: []
        };
      }
      keysByFaculty[userId].keys.push(key);
    }
    
    let facultyNotificationCount = 0;
    let securityNotificationCount = 0;
    
    // Send notifications for each faculty with unreturned keys
    for (const [userId, data] of Object.entries(keysByFaculty)) {
      const { user, keys } = data;
      
      // Send individual pending return notifications for each key
      for (const key of keys) {
        await createKeyPendingReturnNotification(key, user);
        facultyNotificationCount++;
      }
      
      // Send alert to security
      const securityNotifications = await createSecurityAlertNotification(user, keys);
      securityNotificationCount += securityNotifications.length;
    }
    
    console.log(`📢 Sent ${facultyNotificationCount} faculty reminders and ${securityNotificationCount} security alerts`);
    
    return { 
      facultyNotifications: facultyNotificationCount, 
      securityNotifications: securityNotificationCount,
      totalUnreturnedKeys: unreturnedKeys.length
    };
  } catch (error) {
    console.error("❌ Error checking and sending key reminders:", error);
    throw error;
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - The user ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of notifications
 */
export const getUserNotifications = async (userId, options = {}) => {
  try {
    return await Notification.findForUser(userId, options);
  } catch (error) {
    console.error("❌ Error getting user notifications:", error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - The notification ID
 * @param {string} userId - The user ID (for security)
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      'recipient.userId': userId
    });
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    return await notification.markAsRead();
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Get unread notification count for a user
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Unread notification count
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    return await Notification.countUnreadForUser(userId);
  } catch (error) {
    console.error("❌ Error getting unread notification count:", error);
    throw error;
  }
};

/**
 * Cleanup expired notifications
 * @returns {Promise<Object>} Cleanup result
 */
export const cleanupExpiredNotifications = async () => {
  try {
    const result = await Notification.cleanupExpired();
    console.log(`🧹 Cleaned up ${result.deletedCount} expired notifications`);
    return result;
  } catch (error) {
    console.error("❌ Error cleaning up expired notifications:", error);
    throw error;
  }
};
