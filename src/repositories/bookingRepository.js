const { bookingModel } = require("../models/index");

const findBooking = async (payload) => {
  try {
    const booking = await bookingModel.findOne(payload);
    return booking;
  } catch (error) {
    console.log("Something went wrong in repository layer:", error);
    throw error;
  }
};

const createBooking = async (bookingData) => {
  try {
    const booking = await bookingModel.create(bookingData);
    return booking;
  } catch (error) {
    console.log("Something went wrong in repository layer:", error);
    throw error;
  }
};

const confirmBooking = async ({ passengerId, source, destination }) => {
  try {
  } catch (error) {
    console.log("Something went wrong in repository layer:", error);
    throw error;
  }
};

const updateBookingStatus = async (bookingId, driverId, status) => {
  try {
    const booking = await bookingModel.findById({
      bookingId: bookingId,
    });

    booking.driver = driverId;
    booking.status = status;
    await booking.save();

    return booking;
  } catch (error) {
    console.log("Something went wrong in repository layer:", error);
    throw error;
  }
};

module.exports = {
  findBooking,
  createBooking,
  confirmBooking,
  updateBookingStatus
};
