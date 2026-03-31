const bookingService = require("../services/bookingService");
const { io } = require("../index");
const locationService = require("../services/locationService");

const createBooking = (io) => async (req, res) => {
  try {
    
    console.log(req.body);
    const { source, destination } = req.body;

    // new booking object create
    const booking = await bookingService.createBooking({
      passengerId: req.user._id,
      source,
      destination,
    });

    // search near by drivers
    const nearByDrivers = await bookingService.findNearByDrivers(source);
    const driverIds = [];

    // notify near by drivers
    for (const driver of nearByDrivers) {
      // get socketId
      // emit notification -> alert
      const driverSocketId = await locationService.getDriverSocket(driver[0]);

      if (driverSocketId) {
        driverIds.push(driver[0]);

        io.to(driverSocketId).emit("newBooking", {
          bookingId: booking._id,
          source,
          destination,
          fare: booking.fare,
        });
      }
    }

    // store the driverId of nearBy drivers also in the redis
    await locationService.storeNotifiedDrivers(booking._id, driverIds);

    return res.status(200).json({
      success: true,
      data: booking,
      msg: "booking create successfully!",
      error: null,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: {},
      msg: "Not able to create booking",
      error: error,
    });
  }
};

const confirmBooking = (io) => async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await bookingService.assignDriver(bookingId, req.user._id);
    const notifiedDriverIds =
      await locationService.getNotifiedDrivers(bookingId);

    for (const driverId of notifiedDriverIds) {
      const driverSocketId = await locationService.getDriverSocket(bookingId);

      if (driverSocketId) {
        if (driverId == req.user._id) {
          io.to(driverSocketId).emit("rideConfirmed", {
            bookingId,
            driverId: req.user._id,
          });
        } else {
          io.to(driverSocketId).emit("removeBooking", { bookingId });
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: booking,
      msg: "Successfully confirmed booking!",
      error: null,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: {},
      msg: "Not able to confirm the booking",
      error: error,
    });
  }
};

module.exports = {
  createBooking,
  confirmBooking,
};
