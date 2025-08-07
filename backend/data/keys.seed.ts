// Department API Keys Seed Data
// This file contains pre-generated API keys for different departments

export const departmentApiKeys = [
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

// Additional configuration for the seed process
export const seedConfig = {
  clearExistingKeys: true, // Whether to clear existing API keys before seeding
  createAdminUser: true, // Whether to ensure admin user exists
  logProgress: true, // Whether to log progress during seeding
  validateKeys: true, // Whether to validate keys after creation
};
