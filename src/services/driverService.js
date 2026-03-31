const driverRepository = require("../repositories/driverRepository");
const locationService = require("./locationService");

const updateLocation = async (driverId, location) => {
  try {
    console.log(driverId, location);
    
    const lat = parseFloat(location.latitude);
    const long = parseFloat(location.longitude);

    if (Number.isNaN(lat) || Number.isNaN(long)) {
      throw new Error("Invalid coordinated!");
    }

    await locationService.addDriverLocation(driverId, lat, long);

    const updateDetails = await driverRepository.updateDriverLocation(
      driverId,
      {
        type: "Point",
        coordinates: [lat, long],
      },
    );
    return updateDetails;
  } catch (error) {
    console.log("Something went wrong in driver service", error);
    throw error;
  }
};

const getDriverBookings = async () => {
  try {
  } catch (error) {
    console.log("Something went wrong in driver service", error);
    throw error;
  }
};

module.exports = {
  updateLocation,
  getDriverBookings,
};
