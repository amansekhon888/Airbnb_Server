import express from "express";
import User from "../../models/User/User.js";
import { catchAsyncErrors } from "../../middleware/catchAsyncErrors.js";
import ErrorHandler from "../../Utils/errorhandler.js";
import sendToken from "../../Utils/jwtToken.js";
import ResponseHandler from "../../Utils/resHandler.js";
import OTP from "../../models/User/OtpSchema.js";

export const verify = catchAsyncErrors(async (req, res, next) => {
  const { number, email } = req.body;
  //   console.log("number:", number);
  let user;

  if (number) {
    user = await User.findOne({ number });
  } else {
    user = await User.findOne({ email });
  }

  if (user) {
    return ResponseHandler.send(
      res,
      "User already exists",
      {
        registered: true,
      },
      200
    );
  } else {
    return ResponseHandler.send(
      res,
      "User not found",
      { registered: false },
      200
    );
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  //   console.log(req.body);

  const { email, number, password } = req.body;
  let user;
  try {
    if (number) {
      user = await User.findOne({ number }).select("+password");
    } else {
      user = await User.findOne({ email }).select("+password");
    }
    // console.log(user);

    if (!user) {
      return next(new ErrorHandler("Invalid email or phone number", 401));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }
    sendToken(user, 200, res);
  } catch (error) {
    // console.log(error);
    return next(new ErrorHandler(`${error.message}`, 500));
  }
});

// signup on any email or number
export const signup = catchAsyncErrors(async (req, res, next) => {
  const { first_name, last_name, email, number, password } = req.body;
  const existingUser = await User.findOne({ $or: [{ number }, { email }] });
  if (existingUser) {
    return next(new ErrorHandler("User already exists", 400));
  }
  // Create new user
  const newUser = await User.create({
    first_name,
    last_name,
    email,
    number,
    password,
  });
  return ResponseHandler.send(
    res,
    "User registered successfully",
    newUser,
    201
  );
});

// get me
export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  return ResponseHandler.send(res, "User details", user, 200);
});

// Forgot password
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Please provide an email", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  // Generate reset token
  const otp = await OTP.generateOTP(user._id);
  console.log("otp:", otp);
  return ResponseHandler.send(res, "OTP Send Successfully", otp, 200);
});

// verify otp
export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { otp, email } = req.body;

  if (!otp || !email) {
    return next(new ErrorHandler("Please provide OTP and email", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const otpData = await OTP.verifyOTP(user._id, otp);
  console.log(otpData);

  if (!otpData) {
    return next(new ErrorHandler("Invalid OTP or OTP expired", 400));
  }
  await OTP.deleteOne({ userId: user._id, code: otp });
  if (!user.generateResetToken) {
    return next(new ErrorHandler("Reset token generation failed", 500));
  }

  const resetToken = await user.generateResetToken();

  return ResponseHandler.send(
    res,
    "Password reset token generated successfully",
    resetToken,
    200
  );
});
