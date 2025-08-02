const User = require("../models/user.model");
const authService = require("../services/auth.service");
const catchAsync = require("../config/catchAsync");
const httpStatus = require("http-status");
const { sendOTP } = require("../util/sendMail");
const signUp = catchAsync(async (req, res, next) => {
  const data = req.body;

  if (await User.isEmailTaken(req.body.email)) {
    return res.send({ errorMessage: " Email already taken" });
  }
  const { user, accessToken, options } = await authService.register(data);

  return res
    .status(httpStatus.OK)
    .cookie("token", accessToken, options)
    .json({
      message: "Registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        profilePic: user.profilePic,
      },
      token: accessToken,
    });
});

const signIn = catchAsync(async (req, res, next) => {
  try {
    const data = req.body;
    const { user, accessToken, options } = await authService.login(data);
    if (user.isFrozen) {
      user.isFrozen = false;
      await user.save();
    }
    return res
      .status(httpStatus.OK)
      .cookie("token", accessToken, options)
      .json({ message: "Login successfully", user: user, token: accessToken });
  } catch (err) {
    return res.json({ errorMessage: err.message });
  }
});

// Logout
const signOut = catchAsync(async (req, res) => {
  const { options } = await authService.logout(req.user._id);
  return res
    .status(httpStatus.OK)
    .clearCookie("token", options)
    .json({ message: "Logged Out Successfully" });
});

const getAllUser = catchAsync(async (req, res) => {
  const users = await User.find({}).exec();
  return res.status(httpStatus.OK).json({ users: users });
});

// email login
const Register = catchAsync(async (req, res) => {
  try {
    const otp = await authService.emailLogin(req.body);
    return res.json({ message: "OTP sent to your email" });
  } catch (err) {
    return res.status(httpStatus.BAD_REQUEST).json({ errmessage: err.message });
  }
});

const verifyOtpAndRegister = catchAsync(async (req, res) => {
  try {
    const {user, accessToken, options} = await authService.verifyOtpAndRegister(req.body);
    if (!user) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
     }
    return res
      .status(201)
      .json({ message: "User registered successfully", user: user ,token:accessToken});
  } catch (err) {
    return res.status(httpStatus.BAD_REQUEST).json({ errmessage: err.message });
  }
});

module.exports = {
  signUp,
  signIn,
  signOut,
  getAllUser,
  Register,
  verifyOtpAndRegister,
};
