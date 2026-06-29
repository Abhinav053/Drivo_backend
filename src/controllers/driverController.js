const driverService = require("../services/driverService");

const updateLocations = async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        data: null,
        msg: "Only drivers can update location",
        error: "Forbidden",
      });
    }

    const { latitude, longitude } = req.body;
    const driverId = req.user._id;

    if (req.user.isAvailable === false) {
      return res.status(400).json({
        success: false,
        data: null,
        msg: "Driver must be available before updating active location",
        error: "Driver unavailable",
      });
    }

    const location = await driverService.updateLocation(driverId, {
      latitude,
      longitude,
    });

    return res.status(200).json({
      success: true,
      data: location,
      msg: "Successfully update the location",
      error: null,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: null,
      msg: "Error in update location controller!",
      error: error.message,
    });
  }
};

const getDriverBookings = async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        data: null,
        msg: "Only drivers can access driver bookings",
        error: "Forbidden",
      });
    }

    const bookings = await driverService.getDriverBookings(
      req.user._id,
      req.query,
    );

    return res.status(200).json({
      success: true,
      data: bookings,
      msg: "Driver bookings fetched successfully",
      error: null,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: null,
      msg: "Not able to fetch driver bookings",
      error: error.message,
    });
  }
};

const getDriverProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
    msg: "Driver profile fetched successfully",
    error: null,
  });
};

const updateAvailability = async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        data: null,
        msg: "Only drivers can update availability",
        error: "Forbidden",
      });
    }

    const driver = await driverService.updateAvailability(
      req.user._id,
      req.body.isAvailable,
    );

    return res.status(200).json({
      success: true,
      data: driver,
      msg: "Driver availability updated successfully",
      error: null,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: null,
      msg: "Not able to update driver availability",
      error: error.message,
    });
  }
};

module.exports = {
  getDriverBookings,
  updateLocations,
  getDriverProfile,
  updateAvailability,
};
