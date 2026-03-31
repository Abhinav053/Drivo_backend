const bookingRepository = require("../repositories/bookingRepository");
const passengerRepository = require("../repositories/passengerRepository");

const getPassengerById = async (passengerId) => {
  try {
    // console.log("Passenger service hit");
    // console.log(passengerId);

    const passenger = await passengerRepository.getPassengerById(passengerId);
    if (!passenger) throw new Error("Passenger Not Found!");

    return passenger;
  } catch (error) {
    console.log("Something went wrong in service layer:", error);
    throw error;
  }
};

const createPassengerFeedback = async (
  passengerId,
  bookingId,
  rating,
  feedback,
) => {
  try {
    const booking = await bookingRepository.findBooking({
      _id: bookingId,
      passenger: passengerId,
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    booking.rating = rating;
    booking.feedback = feedback;
    await booking.save();

    return booking;
  } catch (error) {
    console.log("Something went wrong in service layer:", error);
    throw error;
  }
};

module.exports = {
  getPassengerById,
  createPassengerFeedback,
};
