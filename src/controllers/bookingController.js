const bookingService = require("../services/bookingService");
const locationService = require("../services/locationService");
const bookingSearchService = require("../services/bookingSearchService");

const createBooking = (io) => async (req, res) => {
  try {
    if (req.user.role !== "passenger") {
      return res.status(403).json({
        success: false,
        data: {},
        msg: "Only passengers can create bookings",
        error: "Forbidden",
      });
    }

    const { source, destination } = req.body;

    const booking = await bookingService.createBooking({
      passengerId: req.user._id,
      source,
      destination,
    });

    const searchResult = await bookingSearchService.startDriverSearch(
      io,
      booking,
    );

    return res.status(200).json({
      success: true,
      data: {
        booking,
        notifiedDrivers: searchResult.notifiedDriverIds,
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
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        data: {},
        msg: "Only drivers can confirm bookings",
        error: "Forbidden",
      });
    }

    const bookingId = req.body.bookingId || req.params.bookingId;

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
        io.to(driverSocketId).emit("rideConfirmed", {
          bookingId,
          driverId: req.user._id,
        });
      } else {
        io.to(driverSocketId).emit("removeBooking", { bookingId });
      }
    }

    const passengerSocketId = await locationService.getPassengerSocket(
      booking.passenger,
    );

    if (passengerSocketId) {
      io.to(passengerSocketId).emit("rideConfirmed", {
        bookingId,
        driverId: req.user._id,
      });
    }

    await locationService.clearNotifiedDrivers(bookingId);

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

const completeBooking = (io) => async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        success: false,
        data: {},
        msg: "Only drivers can complete bookings",
        error: "Forbidden",
      });
    }

    const booking = await bookingService.completeBooking(
      req.params.bookingId,
      req.user._id,
    );

    const passengerSocketId = await locationService.getPassengerSocket(
      booking.passenger?._id || booking.passenger,
    );

    if (passengerSocketId) {
      io.to(passengerSocketId).emit("rideCompleted", {
        bookingId: booking._id,
        status: booking.status,
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
      msg: "Ride completed successfully",
      error: null,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: {},
      msg: "Not able to complete booking",
      error: error.message,
    });
  }
};

const cancelBooking = (io) => async (req, res) => {
  try {
    const booking = await bookingService.cancelBooking(
      req.params.bookingId,
      req.user,
    );

    const passengerSocketId = await locationService.getPassengerSocket(
      booking.passenger?._id || booking.passenger,
    );
    const driverSocketId = booking.driver
      ? await locationService.getDriverSocket(booking.driver?._id || booking.driver)
      : null;

    const payload = {
      bookingId: booking._id,
      status: booking.status,
    };

    if (passengerSocketId) {
      io.to(passengerSocketId).emit("rideCanceled", payload);
    }

    if (driverSocketId) {
      io.to(driverSocketId).emit("rideCanceled", payload);
    }

    return res.status(200).json({
      success: true,
      data: booking,
      msg: "Booking canceled successfully",
      error: null,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: {},
      msg: "Not able to cancel booking",
      error: error.message,
    });
  }
};

const getBookingDetails = async (req, res) => {
  try {
    const booking = await bookingService.getBookingDetails(
      req.params.bookingId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      data: booking,
      msg: "Booking fetched successfully",
      error: null,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      data: {},
      msg: "Not able to fetch booking",
      error: error.message,
    });
  }
};

const getCurrentRide = async (req, res) => {
  try {
    const booking = await bookingService.getCurrentRide(req.user);

    return res.status(200).json({
      success: true,
      data: booking,
      msg: "Current ride fetched successfully",
      error: null,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: {},
      msg: "Not able to fetch current ride",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  confirmBooking,
  completeBooking,
  cancelBooking,
  getBookingDetails,
  getCurrentRide,
};
