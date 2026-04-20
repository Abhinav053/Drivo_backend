const haversineDistance = require("../utils/distance");
const { RATE_PER_KM, BASIC_FAIR } = require("../utils/constants");
const bookingRepository = require("../repositories/bookingRepository");
const locationService = require("./locationService");

const validateLocation = (location, label) => {
  if (!location) {
    throw new Error(`${label} is required`);
  }

  const latitude = parseFloat(location.latitude);
  const longitude = parseFloat(location.longitude);

  locationService.validateCoordinates(latitude, longitude);

  return { latitude, longitude };
};

const createBooking = async (bookingDetails) => {
  try {
    const { passengerId, source, destination } = bookingDetails;

    if (!passengerId || !source || !destination) {
      throw new Error("Invalid booking details");
    }

    const validatedSource = validateLocation(source, "source");
    const validatedDestination = validateLocation(destination, "destination");

    const distance = haversineDistance(
      validatedSource.latitude,
      validatedSource.longitude,
      validatedDestination.latitude,
      validatedDestination.longitude,
    );

    const fare = BASIC_FAIR + distance * RATE_PER_KM;
    if (Number.isNaN(fare)) {
      throw new Error("Fare could not be calculated");
    }

    const booking = await bookingRepository.createBooking({
      passenger: passengerId,
      source: validatedSource,
      destination: validatedDestination,
      fare: Math.round(fare),
      status: "pending",
    });

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
    const { latitude, longitude } = validateLocation(location, "location");
    const radiusKm = parseFloat(radius);

    locationService.validateRadius(radiusKm);

    return await locationService.findNearByDrivers(
      latitude,
      longitude,
      radiusKm,
    );
  } catch (error) {
    console.log("Something went wrong while finding nearby drivers", error);
    throw error;
  }
};

const confirmBooking = async (bookingId, driverId) => {
  try {
    const isNotified = await locationService.isDriverNotified(
      bookingId,
      driverId,
    );

    if (!isNotified) {
      throw new Error("Only notified drivers can accept this booking");
    }

    return await assignDriver(bookingId, driverId);
  } catch (error) {
    console.log("Something went wrong in booking service", error);
    throw error;
  }
};

const assignDriver = async (bookingId, driverId) => {
  try {
    if (!bookingId || !driverId) {
      throw new Error("bookingId and driverId are required");
    }

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
