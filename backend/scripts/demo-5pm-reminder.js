#!/usr/bin/env node

/**
 * 5PM Key Reminder Demonstration Script
 * 
 * This script demonstrates the 5:00 PM key reminder functionality
 * that automatically runs every day to check for unreturned keys
 * and send notifications to faculty and security.
 * 
 * Usage: node scripts/demo-5pm-reminder.js
 */

// Configure environment variables first
import '../config/env.js';

import { connectDB } from '../db/connectDB.js';
import { checkAndSendKeyReminders } from '../services/notificationService.js';
import { Key } from '../models/key.model.js';
import { User } from '../models/user.model.js';

/**
 * Display current unreturned keys status
 */
const displayUnreturnedKeysStatus = async () => {
  console.log('📊 Current Unreturned Keys Status');
  console.log('==================================\n');

  try {
    // Get all unreturned keys
    const unreturnedKeys = await Key.find({ 
      status: 'unavailable',
      'takenBy.userId': { $ne: null },
      isActive: true
    }).populate('takenBy.userId');

    if (unreturnedKeys.length === 0) {
      console.log('✅ No unreturned keys found - all keys are available!');
      return;
    }

    console.log(`📋 Found ${unreturnedKeys.length} unreturned key(s):\n`);

    // Group keys by faculty
    const keysByFaculty = {};
    
    for (const key of unreturnedKeys) {
      const userId = key.takenBy.userId._id.toString();
      if (!keysByFaculty[userId]) {
        keysByFaculty[userId] = {
          user: key.takenBy.userId,
          keys: []
        };
      }
      keysByFaculty[userId].keys.push(key);
    }

    // Display each faculty and their unreturned keys
    let facultyCount = 0;
    for (const [userId, data] of Object.entries(keysByFaculty)) {
      facultyCount++;
      const { user, keys } = data;
      
      console.log(`👤 Faculty ${facultyCount}: ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🏢 Department: ${user.department || 'N/A'}`);
      console.log(`   🔑 Unreturned Keys (${keys.length}):`);
      
      keys.forEach((key, index) => {
        const takenDate = new Date(key.takenAt);
        const hoursAgo = Math.floor((new Date() - takenDate) / (1000 * 60 * 60));
        
        console.log(`      ${index + 1}. ${key.keyNumber} - ${key.keyName}`);
        console.log(`         📍 Location: ${key.location}`);
        console.log(`         ⏰ Taken: ${takenDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (${hoursAgo} hours ago)`);
      });
      console.log('');
    }

    // Get security users count
    const securityCount = await User.countDocuments({ role: 'security', isVerified: true });
    console.log(`🛡️  Security Personnel: ${securityCount} users will receive alerts\n`);

  } catch (error) {
    console.error('❌ Error displaying unreturned keys status:', error);
  }
};

/**
 * Simulate the 5PM reminder process
 */
const simulate5PMReminder = async () => {
  console.log('🕐 Simulating 5:00 PM Key Reminder Process');
  console.log('==========================================\n');

  try {
    console.log('⏰ Time: 5:00 PM IST - Running scheduled key reminder check...\n');

    const result = await checkAndSendKeyReminders();

    console.log('📊 Reminder Process Results:');
    console.log('============================');
    console.log(`✅ Faculty notifications sent: ${result.facultyNotifications}`);
    console.log(`🛡️  Security alerts sent: ${result.securityNotifications}`);
    console.log(`🔑 Total unreturned keys: ${result.totalUnreturnedKeys}`);

    if (result.facultyNotifications > 0) {
      console.log('\n📧 Email notifications have been sent to:');
      console.log('   • Faculty members with unreturned keys (reminder emails)');
      console.log('   • Security personnel (alert emails)');
    } else {
      console.log('\n✅ No notifications needed - all keys are returned!');
    }

  } catch (error) {
    console.error('❌ Error in 5PM reminder simulation:', error);
  }
};

/**
 * Display information about the scheduled job
 */
const displayScheduledJobInfo = () => {
  console.log('📅 Scheduled Job Information');
  console.log('============================\n');

  console.log('🕐 Schedule: Every day at 5:00 PM IST (17:00)');
  console.log('🌍 Timezone: Asia/Kolkata (Indian Standard Time)');
  console.log('🔄 Frequency: Daily');
  console.log('📧 Email Notifications: Enabled for high priority alerts');
  console.log('🔔 Real-time Notifications: Enabled via Socket.IO');
  console.log('🧹 Cleanup Job: Runs daily at midnight to remove expired notifications\n');

  console.log('📋 Process Flow:');
  console.log('1. Check database for unreturned keys (status: unavailable)');
  console.log('2. Group keys by faculty member');
  console.log('3. Send reminder email to each faculty with unreturned keys');
  console.log('4. Send security alert email to all security personnel');
  console.log('5. Create in-app notifications for real-time updates');
  console.log('6. Log results for monitoring\n');

  console.log('🎯 Notification Types:');
  console.log('• Faculty Reminder: "Key Return Reminder - X Keys Pending"');
  console.log('• Security Alert: "Security Alert - Unreturned Keys"');
  console.log('• Priority: High (ensures email delivery)');
  console.log('• Expiry: 30 days (auto-cleanup)\n');
};

/**
 * Main demonstration function
 */
const main = async () => {
  console.log('🔔 VNR Keys - 5PM Reminder System Demonstration');
  console.log('===============================================\n');

  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected\n');

    // Display scheduled job information
    displayScheduledJobInfo();

    // Display current status
    await displayUnreturnedKeysStatus();

    // Ask user if they want to simulate the reminder process
    console.log('🤔 Would you like to simulate the 5PM reminder process?');
    console.log('   This will send actual emails to faculty and security personnel.');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');

    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Simulate the 5PM reminder
    await simulate5PMReminder();

    console.log('\n🎉 Demonstration completed successfully!');
    console.log('\n📝 Notes:');
    console.log('• The actual scheduled job runs automatically at 5:00 PM daily');
    console.log('• No manual intervention is required');
    console.log('• Notifications are stored in the database for tracking');
    console.log('• Email delivery is logged for monitoring');
    console.log('• Real-time notifications work when frontend is connected');

    process.exit(0);

  } catch (error) {
    console.error('\n💥 Demonstration failed:', error);
    process.exit(1);
  }
};

// Run the demonstration
main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
