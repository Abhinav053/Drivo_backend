const generateToken = require("../utils/generateJwtToken");
const authRepository = require("../repositories/authRepository");

const register = async (userData) => {
  try {
    // register logic
    // console.log("auth service hit");
    // console.log(userData?.name);
    // console.log(userData?.email);
    // console.log(userData?.password);
    // console.log(userData?.role);

    if (
      !userData?.name ||
      !userData?.email ||
      !userData?.password ||
      !userData?.role
    ) {
      throw new Error("Invalid Email or Password");
    }

    // Check user already registered or not.
    const userExist = await authRepository.checkUserExist(userData.email);
    if (userExist) {
      console.log("Your account already exist, You need to login!");
      throw new Error("Your account already exist, You need to login!");
    }

    // create user
    const user = await authRepository.register(userData);
    // console.log("User is created", user);

    if (!user) throw new Error("User not created");

    // generate token
    const token = await generateToken(user._id);
    // console.log("token is generated", token);

    if (!token) {
      throw new Error("Something went wrong to generate token");
    }

    return { user, token };
  } catch (error) {
    console.log("Something went wrong in service layer:", error);
    throw error;
  }
};

const login = async (userDetails) => {
  try {
    // login logic
    console.log("Service hit");
    console.log(userDetails);


    if (!userDetails.email || !userDetails.password) {
      throw new Error("Invalid Email or Password");
    }

    const user = await authRepository.login(userDetails);
    if (!user) {
      throw new Error("Something went wrong with user login");
    }

    const token = await generateToken(user._id);
    if (!token) {
      throw new Error("Something went wrong to generate token");
    }

    return { user, token };
  } catch (error) {
    console.log("Something went wrong in service layer:", error);
    throw error;
  }
};

module.exports = {
  register,
  login,
};
