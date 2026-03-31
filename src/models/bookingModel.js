const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    source: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    destination: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    fare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "canceled"],
      default: "pending",
    },
    rating: {
      type: Number,
    },
    feedback: {
      type: String,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
