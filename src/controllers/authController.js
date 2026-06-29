const authService = require("../services/authService");

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  return userObject;
};

const register = async (req, res) => {
  try {
    const { user, token } = await authService.register(req.body);
    return res.status(201).json({
      success: true,
      data: { user: sanitizeUser(user), token },
      error: {},
      message: "User registered successfully",
    });
  } catch (error) {
    const statusCode = error.message.includes("already exist") ? 409 : 400;
    return res.status(statusCode).json({
      success: false,
      data: {},
      error: error.message,
      message: "User Not able to registered",
    });
  }
};

const login = async (req, res) => {
  try {
    const { user, token } = await authService.login(req.body);
    return res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user), token },
      error: {},
      message: "User loggedIn successfully",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: {},
      error: error.message,
      message: "User Not able to loggedIn",
    });
  }
};

module.exports = {
  register,
  login,
};
