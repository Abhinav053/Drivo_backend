const express = require("express");
const passengerRouter = express.Router();

const passengerController = require("../controllers/passengerController");

const { authMiddleware } = require("../middlewares/authMiddleware");

// Protect all passenger routes
passengerRouter.use(authMiddleware);

module.exports = () => {
  passengerRouter.get("/bookings", passengerController.getPassengerDetails);
  passengerRouter.post("/feedback", passengerController.provideFeedback);

  return passengerRouter;
};
