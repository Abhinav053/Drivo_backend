const mongoose = require("mongoose");
const { ATLAS_DB_URL } = require("./serverConfig");

const connectDB = async () => {
  try {
    await mongoose.connect(ATLAS_DB_URL);
    console.log("✅ Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
