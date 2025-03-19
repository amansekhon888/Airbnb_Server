import User from "../../models/User/User.js";
import Property from "../../models/Property/Property.js";
import { catchAsyncErrors } from "../../middleware/catchAsyncErrors.js";
import ErrorHandler from "../../Utils/errorhandler.js";
import ResponseHandler from "../../Utils/resHandler.js";

export const userDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).select(
    "first_name last_name email role isEmailVerified isNumberVerified createdAt languages avatar"
  );
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  //   get user all active properties
  const properties = await Property.find({
    status: "active",
    host_id: id,
  }).select("title price_per_night bedrooms bathrooms gallery tags");
  let isSelfDetails = id.toString() === req.user._id.toString();

  return ResponseHandler.send(
    res,
    "User Details",
    { user, isSelfDetails, properties },
    200
  );
});
