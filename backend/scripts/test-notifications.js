#!/usr/bin/env node

/**
 * Notification System Test Runner
 * 
 * This script provides an easy way to test the notification system
 * with various scenarios and options.
 * 
 * Usage:
 *   node scripts/test-notifications.js [options]
 * 
 * Options:
 *   --all          Run all tests (default)
 *   --basic        Test basic notification creation
 *   --reminders    Test key reminder notifications
 *   --security     Test security alert notifications
 *   --flow         Test complete 5PM reminder flow
 *   --management   Test notification management
 *   --scheduled    Test scheduled job trigger
 *   --cleanup      Only cleanup test data
 *   --setup        Only setup test data
 *   --help         Show this help message
 */

// Configure environment variables first
import '../config/env.js';

import { connectDB } from '../db/connectDB.js';
import {
  runAllTests,
  setupTestData,
  testBasicNotification,
  testKeyReminderNotification,
  testSecurityAlertNotification,
  testCompleteReminderFlow,
  testNotificationManagement,
  testScheduledJobTrigger,
  cleanupTestData
} from '../tests/notification.test.js';

/**
 * Parse command line arguments
 */
const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    all: false,
    basic: false,
    reminders: false,
    security: false,
    flow: false,
    management: false,
    scheduled: false,
    cleanup: false,
    setup: false,
    help: false
  };

  for (const arg of args) {
    switch (arg) {
      case '--all':
        options.all = true;
        break;
      case '--basic':
        options.basic = true;
        break;
      case '--reminders':
        options.reminders = true;
        break;
      case '--security':
        options.security = true;
        break;
      case '--flow':
        options.flow = true;
        break;
      case '--management':
        options.management = true;
        break;
      case '--scheduled':
        options.scheduled = true;
        break;
      case '--cleanup':
        options.cleanup = true;
        break;
      case '--setup':
        options.setup = true;
        break;
      case '--help':
        options.help = true;
        break;
      default:
        console.warn(`⚠️  Unknown option: ${arg}`);
    }
  }

  // Default to all tests if no specific options provided
  if (!Object.values(options).some(v => v)) {
    options.all = true;
  }

  return options;
};

/**
 * Show help message
 */
const showHelp = () => {
  console.log(`
🔔 Notification System Test Runner

Usage: node scripts/test-notifications.js [options]

Options:
  --all          Run all tests (default)
  --basic        Test basic notification creation
  --reminders    Test key reminder notifications
  --security     Test security alert notifications
  --flow         Test complete 5PM reminder flow
  --management   Test notification management
  --scheduled    Test scheduled job trigger
  --cleanup      Only cleanup test data
  --setup        Only setup test data
  --help         Show this help message

Examples:
  node scripts/test-notifications.js
  node scripts/test-notifications.js --all
  node scripts/test-notifications.js --reminders --security
  node scripts/test-notifications.js --cleanup
  node scripts/test-notifications.js --setup
`);
};

/**
 * Run specific tests based on options
 */
const runTests = async (options) => {
  let testData = null;

  try {
    if (options.cleanup) {
      await cleanupTestData();
      return;
    }

    if (options.setup) {
      testData = await setupTestData();
      console.log('✅ Test data setup completed');
      return;
    }

    if (options.all) {
      await runAllTests();
      return;
    }

    // Setup test data for individual tests
    testData = await setupTestData();
    const { facultyUser, securityUser, testKeys } = testData;

    if (options.basic) {
      await testBasicNotification(facultyUser);
    }

    if (options.reminders) {
      await testKeyReminderNotification(facultyUser, testKeys);
    }

    if (options.security) {
      await testSecurityAlertNotification(facultyUser, testKeys);
    }

    if (options.flow) {
      await testCompleteReminderFlow();
    }

    if (options.management) {
      await testNotificationManagement(facultyUser);
      await testNotificationManagement(securityUser);
    }

    if (options.scheduled) {
      await testScheduledJobTrigger();
    }

    console.log('\n✅ Selected tests completed successfully!');

    // Cleanup test data
    await cleanupTestData();

  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    
    // Attempt cleanup
    try {
      await cleanupTestData();
    } catch (cleanupError) {
      console.error('❌ Cleanup also failed:', cleanupError);
    }
    
    throw error;
  }
};

/**
 * Main function
 */
const main = async () => {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  console.log('🔔 Notification System Test Runner');
  console.log('==================================\n');

  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected\n');

    // Run tests
    await runTests(options);

    console.log('\n🎉 Test runner completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n💥 Test runner failed:', error);
    process.exit(1);
  }
};

// Run the main function
main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
