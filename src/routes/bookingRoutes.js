const express = require("express");

const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  createBooking,
  confirmBooking,
  completeBooking,
  cancelBooking,
  getBookingDetails,
  getCurrentRide,
} = require("../controllers/bookingController");

module.exports = (io) => {
  const bookingRouter = express.Router();

  bookingRouter.use(authMiddleware);

  bookingRouter.post("/", createBooking(io));
  bookingRouter.get("/current", getCurrentRide);
  bookingRouter.post("/confirm", confirmBooking(io));
  bookingRouter.post("/:bookingId/confirm", confirmBooking(io));
  bookingRouter.post("/:bookingId/complete", completeBooking(io));
  bookingRouter.post("/:bookingId/cancel", cancelBooking(io));
  bookingRouter.get("/:bookingId", getBookingDetails);
  return bookingRouter;
};
