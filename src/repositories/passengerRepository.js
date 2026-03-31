const { userModel } = require("../models/index");

const getPassengerById = async (passengerId) => {
  try {
    // console.log("Passenger repo hit");

    const passenger = await userModel.findOne({
      _id: passengerId,
      role: "passenger",
    });

    console.log("Passenger details : ", passengerId);

    return passenger;
  } catch (error) {
    console.log("Something went wrong in repository layer:", error);
    throw error;
  }
};

const createPassengerFeedback = async ({ email, password }) => {
  try {
  } catch (error) {
    console.log("Something went wrong in repository layer:", error);
    throw error;
  }
};

module.exports = {
  getPassengerById,
  createPassengerFeedback,
};
