const express = require("express");
const driverRouter = express.Router();

const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getDriverBookings,
  updateLocations,
} = require("../controllers/driverController");

// Protect all driver routes
driverRouter.use(authMiddleware);

driverRouter.get("/bookings", getDriverBookings);
driverRouter.post("/location", updateLocations);

module.exports = driverRouter;
