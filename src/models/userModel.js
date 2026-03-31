const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { SALT_ROUND } = require("../config/serverConfig");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      min: 4,
      max: 20,
    },
    role: {
      type: String,
      required: true,
      enum: ["passenger", "driver"],
      default: "passenger",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  { timestamps: true },
);

// this is a pre save middleware that run before a document is saved to the db.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    this.password = await bcrypt.hash(this.password, SALT_ROUND);
  } catch (error) {
    console.log(error);
    throw error;
  }
});

// user defined Compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = new mongoose.model("User", userSchema);

module.exports = User;
