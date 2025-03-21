import { mongoose, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import OtpSchema from "./OtpSchema.js";
import validator from "validator";

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
    },
    number: {
      type: Number,
      message: "Please enter a valid number",
    },
    avatar:{
      url: String,
      publicId: String,
    },
    email: {
      type: String,
      validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password should be at least 8 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    dob: {
      type: Date,
    },
    address: {
      building_no: { type: String },
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String, default: "Dubai" },
      zip_code: { type: String },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isNumberVerified: {
      type: Boolean,
      default: false,
    },
    isHost: Boolean,
    languages: [String],
    bio: String,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  user.password = await bcrypt.hash(user.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// jwt authentication
UserSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};
// generateResetToken
UserSchema.methods.generateResetToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });
};
// verify Token
UserSchema.statics.verifyToken = async function (token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await this.findById(decoded.id);
    if (!user) {
      throw new Error();
    }
    return user;
  } catch (err) {
    throw new Error("Token is invalid or expired");
  }
};

export default mongoose.model("User", UserSchema);
