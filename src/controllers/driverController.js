const driverService = require("../services/driverService");

const updateLocations = async (req, res) => {
  try {
    console.log(req.body);
    const { latitude, longitude } = req.body;
    const driverId = req.user._id;

    const location = await driverService.updateLocation(driverId, {
      latitude,
      longitude,
    });

    return res.status(200).json({
      success: true,
      data: {},
      msg: "Successfully update the location",
      error: null,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      msg: "Error in update location controller!",
      error: error,
    });
  }
};

const getDriverBookings = async (req, res) => {
  try {
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      msg: "booking create successfully!",
      error: error,
    });
  }
};

module.exports = {
  getDriverBookings,
  updateLocations,
};
