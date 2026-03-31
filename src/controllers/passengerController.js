const passengerService = require("../services/passengerService");

const getPassengerDetails = async (req, res) => {
  try {
    // console.log("Passenger controller hit");
    // console.log(req.user);

    const passengerDetails = await passengerService.getPassengerById(
      req.user._id,
    );
    return res.status(200).json({
      success: true,
      data: passengerDetails,
      error: {},
      message: "Successfully fetched passenger details",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: {},
      error: error.message,
      message: "Not able to fetched passenger details",
    });
  }
};

const provideFeedback = async (req, res) => {
  try {
    const { bookingId, rating, feedback } = req.body;
    const response = await passengerService.createPassengerFeedback(
      req.user._id,
      bookingId,
      rating,
      feedback,
    );
    return res.status(200).json({
      success: true,
      data: response,
      error: {},
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: {},
      error: error.message,
      message: "Not able to submit feedback",
    });
  }
};

module.exports = {
  getPassengerDetails,
  provideFeedback,
};
