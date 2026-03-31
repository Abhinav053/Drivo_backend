const { userModel } = require("../models/index");

const register = async (userData) => {
  try {
    // console.log("auth repo is hit");
    // console.log(userData);

    const { name, email, password, role } = userData;
    // console.log(userModel.create);

    const user = await userModel.create({ name, email, password, role });
    return user;
  } catch (error) {
    console.log("Something went wrong in repository layer:", error);
    throw error;
  }
};

const checkUserExist = async (userEmail) => {
  try {
    const user = await userModel.findOne({ email: userEmail });
    return user;
  } catch (error) {
    console.log("Something went wrong in repository layer:", error);
    throw error;
  }
};

const findUserById = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    return user;
  } catch (error) {
    console.log("Something went wrong in repository layer:", error);
    throw error;
  }
};

const login = async (userDetails) => {
  try {
    console.log("Repo hit");
    // console.log(email, password);

    const user = await userModel.findOne({ email: userDetails.email });

    // compare password
    const checkPassword = await user.comparePassword(userDetails.password, user.password);
    if (!checkPassword) {
      throw new Error("Invalid Email and Password");
    }

    if (userDetails?.location) {
      user.location = userDetails.location;
      await user.save();
    }

    return user;
  } catch (error) {
    console.log("Something went wrong in repository layer:", error);
    throw error;
  }
};

module.exports = {
  register,
  login,
  checkUserExist,
  findUserById,
};
