import Review from "../../models/Property/Review.js";
import Property from "../../models/Property/Property.js";
import { catchAsyncErrors } from "../../middleware/catchAsyncErrors.js";
import ErrorHandler from "../../Utils/errorhandler.js";
import ResponseHandler from "../../Utils/resHandler.js";

export const postReview = catchAsyncErrors(async (req, res, next) => {
  const { propertyId } = req.params;
  console.log(propertyId);
  
  const { rating, content } = req.body;
  const userId = req.user._id;

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  const existingReview = await Review.findOne({ propertyId, userId });
  if (existingReview) {
    return next(
      new ErrorHandler("You have already reviewed this property", 400)
    );
  }
  const review = await Review.create({
    userId,
    propertyId,
    content,
    rating,
  });

  // Update the avgRating of the property
  const reviews = await Review.find({ propertyId });
  const totalRating = reviews.reduce((acc, rev) => acc + rev.rating, 0);
  const avgRating = totalRating / reviews.length;

  await Property.findByIdAndUpdate(propertyId, {
    avgRating: avgRating.toFixed(1),
  });

  return ResponseHandler.send(
    res,
    "Review added successfully",
    { review },
    201
  );
});

// get property reviews
