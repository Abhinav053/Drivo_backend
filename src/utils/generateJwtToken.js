const jwt = require("jsonwebtoken");

const { JWT_SECRET, JWT_EXPIRY } = require("../config/serverConfig");

const generateToken = async (userId) => {
  try {
    const token = await jwt.sign({ _id: userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });
    if (!token) {
      throw new Error("Wrong user credentials");
    }

    return token;
  } catch (error) {
    console.log("Error not able to generate jwt token");
    throw new Error("Note able to generate token");
  }
};

module.exports = generateToken;
