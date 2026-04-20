const driverRepository = require("../repositories/driverRepository");
const locationService = require("./locationService");

const updateLocation = async (driverId, location) => {
  try {
    if (!location) {
      throw new Error("Location is required");
    }

    const lat = parseFloat(location.latitude);
    const long = parseFloat(location.longitude);

    locationService.validateCoordinates(lat, long);

    await locationService.addDriverLocation(driverId, lat, long);

    const updateDetails = await driverRepository.updateDriverLocation(
      driverId,
      {
        type: "Point",
        coordinates: [long, lat],
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
