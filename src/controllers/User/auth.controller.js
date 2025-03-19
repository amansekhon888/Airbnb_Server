import User from "../../models/User/User.js";
import { catchAsyncErrors } from "../../middleware/catchAsyncErrors.js";
import ErrorHandler from "../../Utils/errorhandler.js";
import sendToken from "../../Utils/jwtToken.js";
import ResponseHandler from "../../Utils/resHandler.js";
import OTP from "../../models/User/OtpSchema.js";

export const verify = catchAsyncErrors(async (req, res, next) => {
  const { number, email } = req.body;
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
      { registered: true },
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
  const { email, number, password } = req.body;
  let user;
  try {
    if (number) {
      user = await User.findOne({ number }).select("+password");
    } else {
      user = await User.findOne({ email }).select("+password");
    }

    if (!user) {
      return next(new ErrorHandler("Invalid email or phone number", 401));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }
    user.password = undefined;

    sendToken(user, 200, res);
  } catch (error) {
    return next(new ErrorHandler(`${error.message}`, 500));
  }
});

// signup on any email or number
export const signup = catchAsyncErrors(async (req, res, next) => {
  const { first_name, last_name, email, number, password } = req.body;
  let existingUser;

  if (number) {
    existingUser = await User.findOne({ number });
  } else {
    existingUser = await User.findOne({ email });
  }
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
  const { email, number } = req.body;
  if (!email && !number) {
    return next(
      new ErrorHandler("Please provide an email or phone number", 400)
    );
  }
  let user;

  if (number) {
    user = await User.findOne({ number });
  } else {
    user = await User.findOne({ email });
  }
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  const otp = await OTP.generateOTP(user._id);
  return ResponseHandler.send(res, "OTP sent successfully", otp, 200);
});

// verify otp
export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { otp, email, number } = req.body;
  if (!otp || (!email && !number)) {
    return next(
      new ErrorHandler("Please provide OTP and email or phone number", 400)
    );
  }
  let user;

  if (number) {
    user = await User.findOne({ number });
  } else {
    user = await User.findOne({ email });
  }
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  const otpData = await OTP.verifyOTP(user._id, otp);
  console.log(otpData);
  if (!otpData) {
    return next(new ErrorHandler("OTP invalid or expired", 400));
  }
  await OTP.deleteOne({ userId: user._id, code: otp });
  const resetToken = await user.generateResetToken();
  return ResponseHandler.send(
    res,
    "Password reset token generated successfully",
    resetToken,
    200
  );
});

// Reset password
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return next(
      new ErrorHandler("Reset token and new password are required", 400)
    );
  }
  console.log(newPassword);

  const user = await User.verifyToken(resetToken);
  if (!user) {
    return next(new ErrorHandler("Invalid or expired reset token", 400));
  }

  // Hash and update new password
  user.password = newPassword;
  await user.save();

  return ResponseHandler.send(res, "Password reset successful", {}, 200);
});

// update profile

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body);
  
  
  const {
    first_name,
    last_name,
    email,
    number,
    avatarUrl,
    dob,
    bio,
    languages,
  } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      first_name,
      last_name,
      email,
      number,
      avatar: { url: avatarUrl },
      dob,
      bio,
      languages,
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  return ResponseHandler.send(res, "Profile updated successfully", user, 200);
});
