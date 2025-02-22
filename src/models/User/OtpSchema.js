import mongoose from "mongoose";
import ErrorHandler from "../../Utils/errorhandler.js";
import { catchAsyncErrors } from "../../middleware/catchAsyncErrors.js";

const OTPSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    expires: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 60 * 1000), 
      expires: 0,
    },
  },
  { timestamps: true }
);

// OTPSchema.index({ expiryTime: 1 }, { expireAfterSeconds: 0 });

// generate the OTP

OTPSchema.statics.generateOTP = async function (userId) {
  const otp = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit OTP

  const otpDocument = await this.findOneAndUpdate(
    { userId },
    {
      code: otp,
      expiryTime: new Date(Date.now() + 10 * 60 * 1000), // Reset expiry to 10 mins
    },
    { upsert: true, new: true }
  );

  return otpDocument.code;
};

// verify otp
OTPSchema.statics.verifyOTP = async function (userId, enteredOTP) {
  console.log("Verifying OTP for userId:", userId, "Entered OTP:", enteredOTP);

  const otpDocument = await this.findOne({
    userId,
    code: enteredOTP,
    expiryTime: { $gt: new Date() }, // Ensure OTP is not expired
  });

  console.log("OTP Found in DB:", otpDocument);

  return otpDocument; // Returns `null` if OTP is not found
};

export default mongoose.model("OTP", OTPSchema);
