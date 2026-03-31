const express = require("express");
const bookingRouter = express.Router();

const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  createBooking,
  confirmBooking,
} = require("../controllers/bookingController");

// Protect all booking routes
bookingRouter.use(authMiddleware);

module.exports = (io) => {
  bookingRouter.post("/", createBooking(io));
  bookingRouter.post("/confirm", confirmBooking(io));
  return bookingRouter;
};
