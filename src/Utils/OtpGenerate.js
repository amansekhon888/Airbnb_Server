import OTPModel from '../models/User/OtpSchema.js'

// Generate and Save OTP
export const generateOTP = async (userId) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpEntry = new OTPModel({
    userId,
    code: otp,
    expiryTime: new Date(Date.now() + 10 * 60 * 1000), // 10 mins expiry
  });

  await otpEntry.save();
  return otp;
};

// Validate OTP
export const validateOTP = async (userId, otp) => {
  const otpRecord = await OTPModel.findOne({ userId, code: otp });

  if (!otpRecord || otpRecord.expiryTime < new Date()) {
    return false;
  }

  // OTP is valid, remove it after successful verification
  await OTPModel.deleteOne({ _id: otpRecord._id });
  return true;
};
