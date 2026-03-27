const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: "master@admin.com" });

    if (!adminExists) {
      await User.create({
        name: "Master Admin",
        email: "master@admin.com",
        password: "password123", // Force-hashed by the pre-save hook in User model
        role: "admin",
        branch: "Master",
      });
      console.log(
        "SUCCESS: Master Admin Created (master@admin.com / password123)",
      );
    } else {
      console.log("WARNING: Master Admin already exists");
    }

    process.exit();
  } catch (error) {
    console.error("ERROR SEEDING:", error);
    process.exit(1);
  }
};

seedAdmin();
