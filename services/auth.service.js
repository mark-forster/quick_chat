const User = require("../models/user.model");
const ApiError = require("../config/apiError");
const httpStatus = require("http-status");
const otpService = require("./otp.service");
const {sendOTP}= require("../util/sendMail");
const register = async (data) => {
  const { name, username, email, password } = data;
  // validate input values
  if (!name || !username || !email || !password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Email and password are required"
    );
  }
  const user = await User.create(data);
  const accessToken = await user.generateAccessToken();
  const options = {
    httpOnly: true,
    secure: true,
  };
  return { user, accessToken, options };
};

const login = async (data) => {
  const { email, password } = data;
  // validate input values
  if (!email || !password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Email and password are required"
    );
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Username or Password");
  }
  const isPasswordValid = await user.isPasswordMatch(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Username or Password");
  }
  const accessToken = await user.generateAccessToken();
  const loginUser = await User.findById(user._id).select("-password ");
  const options = {
    httpOnly: true,
    secure: true,
  };
  return { user: loginUser, accessToken: accessToken, options: options };
};

const logout = async (user_id) => {
  const user = await User.findByIdAndUpdate(
    user_id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return { user, options };
};

const emailLogin = async (body) => {
  const { email, name, username, password } = body;
  const otp = await otpService.generateAndSaveOTP(email, {
    name,
    username,
    email,
    password: password,
  });
  await sendOTP(email,otp);
  return { message: "OTP sent to email" };
};

const verifyOtpAndRegister = async (body) => {
  const { email, otp } = body;
  const userData = await otpService.verifyOTP(email, otp);

  if (!userData) {
    return { errorMessage: "Invalid or expired OTP" };
  }

  const userExists = await User.findOne({ email });
  if (userExists)
    return{ message: "User already exists" };

  const user = await User.create(userData);
   const accessToken = await user.generateAccessToken();
  const options = {
    httpOnly: true,
    secure: true,
  };
  await otpService.clearOTP(email);
  return { user, accessToken, options };
};

module.exports = {
  register,
  login,
  logout,
  emailLogin,
  verifyOtpAndRegister,
};
