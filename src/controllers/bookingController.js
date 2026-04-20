const bookingService = require("../services/bookingService");
const locationService = require("../services/locationService");

const createBooking = (io) => async (req, res) => {
  try {
    const { source, destination, radiusKm } = req.body;

    const booking = await bookingService.createBooking({
      passengerId: req.user._id,
      source,
      destination,
    });

    const nearByDrivers = await bookingService.findNearByDrivers(
      source,
      radiusKm,
    );
    const driverIds = [];

    for (const driver of nearByDrivers) {
      const driverId = driver[0];
      const driverSocketId = await locationService.getDriverSocket(driverId);

      if (driverSocketId) {
        driverIds.push(driverId);

        io.to(driverSocketId).emit("new-booking", {
          bookingId: booking._id,
          source: booking.source,
          destination: booking.destination,
          fare: booking.fare,
        });
      }
    }

    await locationService.storeNotifiedDrivers(booking._id, driverIds);

    return res.status(200).json({
      success: true,
      data: {
        booking,
        notifiedDrivers: driverIds,
      },
      msg: "booking create successfully!",
      error: null,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: {},
      msg: "Not able to create booking",
      error: error.message,
    });
  }
};

const confirmBooking = (io) => async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await bookingService.confirmBooking(
      bookingId,
      req.user._id,
    );
    const notifiedDriverIds =
      await locationService.getNotifiedDrivers(bookingId);

    for (const driverId of notifiedDriverIds) {
      const driverSocketId = await locationService.getDriverSocket(driverId);

      if (!driverSocketId) {
        continue;
      }

      if (driverId === req.user._id.toString()) {
        io.to(driverSocketId).emit("booking-accepted", {
          bookingId,
          driverId: req.user._id,
        });
      } else {
        io.to(driverSocketId).emit("remove-booking", { bookingId });
      }
    }

    const passengerSocketId = await locationService.getPassengerSocket(
      booking.passenger,
    );

    if (passengerSocketId) {
      io.to(passengerSocketId).emit("ride-confirmed", {
        bookingId,
        driverId: req.user._id,
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
      msg: "Successfully confirmed booking!",
      error: null,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: {},
      msg: "Not able to confirm the booking",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  confirmBooking,
};
