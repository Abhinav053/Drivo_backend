const { userModel } = require("../models/index");

const updateDriverLocation = async (driverId, location) => {
  try {
    const updateDetails = await userModel.findByIdAndUpdate(
      driverId,
      { location },
      { new: true },
    );

    return updateDetails;
  } catch (error) {
    console.log("Something went wrong in repository layer:", error);
    throw error;
  }
};

const getDriverBookings = async () => {
  try {
  } catch (error) {
    console.log("Something went wrong in repository layer:", error);
    throw error;
  }
};

module.exports = {
  updateDriverLocation,
  getDriverBookings,
};
