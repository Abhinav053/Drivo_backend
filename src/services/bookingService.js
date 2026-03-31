const haversineDistance = require("../utils/distance");
const { RATE_PER_KM, BASIC_FAIR } = require("../utils/constants");
const bookingRepository = require("../repositories/bookingRepository");
const locationService = require("./locationService");

const createBooking = async (bookingDetails) => {
  try {
    console.log("booking service: ", bookingDetails);

    const { passengerId, source, destination } = bookingDetails;

    if (!passengerId || !source || !destination) {
      throw new Error("Invalid booking details");
    }

    const distance = haversineDistance(
      source.latitude,
      source.longitude,
      destination.latitude,
      destination.longitude,
    );
    console.log("distance is ", distance);

    const fare = BASIC_FAIR + distance * RATE_PER_KM;
    if (!fare) {
      throw new Error("fare Not calculate");
    }

    console.log("fare", fare);

    const bookingData = {
      passengerId,
      source,
      destination,
      fare,
      status: "pending",
    };

    const booking = await bookingRepository.createBooking(bookingData);
    if (!booking) {
      throw new Error("Something went wrong in booking creation");
    }

    return booking;
  } catch (error) {
    console.log("Something went wrong in booking service", error);
    throw error;
  }
};

const findNearByDrivers = async (location, radius = 5) => {
  try {
    const latitude = parseFloat(location.latitude);
    const longitude = parseFloat(location.longitude);
    const radiusKm = parseFloat(radius);

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude) ||
      Number.isNaN(radiusKm)
    ) {
      throw new Error("Invalid coordinated and radius");
    }

    const nearByDrivers = await locationService.findNearByDrivers(
      latitude,
      longitude,
      radiusKm,
    );

    return nearByDrivers;
  } catch (error) {}
};

const confirmBooking = async (bookingDetails) => {
  try {
  } catch (error) {
    console.log("Something went wrong in booking service", error);
    throw error;
  }
};

const assignDriver = async (bookingId, driverId) => {
  try {
    const booking = await bookingRepository.updateBookingStatus(
      bookingId,
      driverId,
      "confirmed",
    );

    if (!booking) {
      throw new Error("Booking already confirmed or does not exist");
    }

    return booking;
  } catch (error) {
    console.log("Something went wrong in booking service", error);
    throw error;
  }
};

module.exports = {
  createBooking,
  confirmBooking,
  assignDriver,
  findNearByDrivers,
};
