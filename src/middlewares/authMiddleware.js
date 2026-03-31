const jwt = require("jsonwebtoken");

const { userModel } = require("../models/index");
const { JWT_SECRET } = require("../config/serverConfig");
const userRepository = require("../repositories/authRepository");

async function authMiddleware(req, res, next) {
  try {
    // Some code here.
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("auth middleware", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        data: {},
        error: null,
        message: "Access Denied",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token", decoded);

    const user = await userRepository.findUserById(decoded._id);
    console.log("auth user: ", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found",
      });
    }

    // added user in req object
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}

async function isLoggedIn(req, res, next) {
  try {
    // Token check logic
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authMiddleware,
  isLoggedIn,
};
