import ErrorHandler from "../Utils/errorhandler.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import User from "../models/User/User.js";

const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  let token;
  // Check for token in cookies, session, or Authorization header
  // if (req.cookies.token) {
  //   token = req.cookies.token;
  //   console.log("cookies:", token);
  // } else if (req.session.token) {
  //   token = req.session.token;
  //   console.log("session:", token);
  // } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
  //   token = req.headers.authorization.split(' ')[1];
  //   console.log("headers:", token);
  // }
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData.id);

  next();
});

const authorizeRoles = (...roles) => {
  // console.log(req.user.role);
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resouce `,
          403
        )
      );
    }

    next();
  };
};

export { authorizeRoles, isAuthenticatedUser };
