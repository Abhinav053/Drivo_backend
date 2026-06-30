const express = require("express");
const driverRouter = express.Router();

const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getDriverBookings,
  updateLocations,
  getDriverProfile,
  updateAvailability,
} = require("../controllers/driverController");
const { getCurrentRide } = require("../controllers/bookingController");

// Protect all driver routes
driverRouter.use(authMiddleware);

driverRouter.get("/profile", getDriverProfile);
driverRouter.get("/bookings", getDriverBookings);
driverRouter.get("/current-ride", getCurrentRide);
driverRouter.post("/location", updateLocations);
driverRouter.patch("/availability", updateAvailability);

module.exports = driverRouter;
