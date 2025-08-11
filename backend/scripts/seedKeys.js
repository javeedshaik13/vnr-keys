import mongoose from "mongoose";
import dotenv from "dotenv";
import { Key } from "../models/key.model.js";

dotenv.config();

const sampleKeys = [
  {
    keyNumber: "101",
    keyName: "Computer Lab 1",
    location: "Block A - Floor 1",
    description: "Main computer laboratory with 30 workstations",
    category: "lab",
    department: "CSE",
    frequentlyUsed: true,
  },
  {
    keyNumber: "102",
    keyName: "Computer Lab 2",
    location: "Block A - Floor 1",
    description: "Secondary computer laboratory with 25 workstations",
    category: "lab",
    department: "CSE",
    frequentlyUsed: true,
  },
  {
    keyNumber: "201",
    keyName: "Physics Lab",
    location: "Block B - Floor 2",
    description: "Physics laboratory with experimental equipment",
    category: "lab",
    department: "EEE",
    frequentlyUsed: false,
  },
  {
    keyNumber: "202",
    keyName: "Chemistry Lab",
    location: "Block B - Floor 2",
    description: "Chemistry laboratory with fume hoods and safety equipment",
    category: "lab",
    department: "CIVIL",
    frequentlyUsed: true,
  },
  {
    keyNumber: "301",
    keyName: "Biology Lab",
    location: "Block C - Floor 3",
    description: "Biology laboratory with microscopes and specimens",
    category: "lab",
    department: "RESEARCH",
    frequentlyUsed: false,
  },
  {
    keyNumber: "401",
    keyName: "Library Study Room 1",
    location: "Library - Floor 4",
    description: "Private study room for group discussions",
    category: "classroom",
    department: "COMMON",
    frequentlyUsed: true,
  },
  {
    keyNumber: "402",
    keyName: "Library Study Room 2",
    location: "Library - Floor 4",
    description: "Private study room with presentation equipment",
    category: "classroom",
    department: "COMMON",
    frequentlyUsed: false,
  },
  {
    keyNumber: "501",
    keyName: "Conference Room A",
    location: "Administration Block - Floor 5",
    description: "Large conference room with video conferencing setup",
    category: "office",
    department: "ADMIN",
    frequentlyUsed: true,
  },
  {
    keyNumber: "502",
    keyName: "Conference Room B",
    location: "Administration Block - Floor 5",
    description: "Medium conference room for departmental meetings",
    category: "office",
    department: "ADMIN",
    frequentlyUsed: false,
  },
  {
    keyNumber: "601",
    keyName: "Storage Room 1",
    location: "Basement - Block A",
    description: "General storage for office supplies",
    category: "storage",
    department: "ADMIN",
    frequentlyUsed: false,
  },
  {
    keyNumber: "602",
    keyName: "IT Equipment Storage",
    location: "Basement - Block B",
    description: "Secure storage for IT equipment and servers",
    category: "storage",
    department: "IT",
    frequentlyUsed: false,
  },
  {
    keyNumber: "701",
    keyName: "Auditorium",
    location: "Main Building - Ground Floor",
    description: "Main auditorium with 200 seating capacity",
    category: "classroom",
    department: "COMMON",
    frequentlyUsed: true,
  },
  {
    keyNumber: "702",
    keyName: "Seminar Hall 1",
    location: "Main Building - Floor 1",
    description: "Seminar hall with 50 seating capacity",
    category: "classroom",
    department: "COMMON",
    frequentlyUsed: true,
  },
  {
    keyNumber: "703",
    keyName: "Seminar Hall 2",
    location: "Main Building - Floor 1",
    description: "Seminar hall with 30 seating capacity",
    category: "classroom",
    department: "COMMON",
    frequentlyUsed: false,
  },
  {
    keyNumber: "801",
    keyName: "Faculty Lounge",
    location: "Faculty Block - Floor 2",
    description: "Common area for faculty members",
    category: "office",
    department: "COMMON",
    frequentlyUsed: false,
  },
];

const seedKeys = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully");

    // Clear existing keys
    console.log("Clearing existing keys...");
    await Key.deleteMany({});
    console.log("Existing keys cleared");

    // Insert sample keys
    console.log("Inserting sample keys...");
    const insertedKeys = await Key.insertMany(sampleKeys);
    console.log(`${insertedKeys.length} keys inserted successfully`);

    // Display inserted keys
    console.log("\nInserted Keys:");
    insertedKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.keyNumber} - ${key.keyName} (${key.location})`);
    });

    console.log("\n✅ Key seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding keys:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
};

// Run the seed function
seedKeys();
