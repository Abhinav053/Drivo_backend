const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    // console.log("auth controller hit");

    const { user, token } = await authService.register(req.body);
    return res.status(201).json({
      success: true,
      data: { user, token },
      error: {},
      message: "User registered successfully",
    });
  } catch (error) {
    return res.status(201).json({
      success: false,
      data: {},
      error: error,
      message: "User Not able to registered",
    });
  }
};

const login = async (req, res) => {
  try {
    console.log("controller hit");

    console.log(req.body);

    const { user, token } = await authService.login(req.body);
    return res.status(201).json({
      success: true,
      data: { user, token },
      error: {},
      message: "User loggedIn successfully",
    });
  } catch (error) {
    return res.status(201).json({
      success: false,
      data: {},
      error: error,
      message: "User Not able to loggedIn",
    });
  }
};

module.exports = {
  register,
  login,
};
