const express = require("express");

const passengerController = require("../controllers/passengerController");

const { authMiddleware } = require("../middlewares/authMiddleware");
const { getCurrentRide } = require("../controllers/bookingController");

module.exports = () => {
  const passengerRouter = express.Router();

  passengerRouter.use(authMiddleware);

  passengerRouter.get("/details", passengerController.getPassengerDetails);
  passengerRouter.get("/me", passengerController.getPassengerDetails);
  passengerRouter.get("/bookings", passengerController.getPassengerBookings);
  passengerRouter.get("/ride-status", getCurrentRide);
  passengerRouter.post("/feedback", passengerController.provideFeedback);

  return passengerRouter;
};
