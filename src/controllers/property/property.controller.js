import User from "../../models/User/User.js";
import Property from "../../models/Property/Property.js";
import Amenities from "../../models/Property/Amenities.js";
import Wishlists from "../../models/Property/Wishlist.js";
import Category from "../../models/Property/Category.js";
import { catchAsyncErrors } from "../../middleware/catchAsyncErrors.js";
import ErrorHandler from "../../Utils/errorhandler.js";
import ResponseHandler from "../../Utils/resHandler.js";
import Reservation from "../../models/Reservation/Reservation.js";

export const addProperty = catchAsyncErrors(async (req, res, next) => {
  // console.log(req.body);

  const { step, id, ...propertyData } = req.body;
  console.log(propertyData);

  // Validate Step
  const stepUpdates = {
    1: [
      "host_id",
      "category",
      "title",
      "property_type",
      "description",
      "type_of_place",
      "availability_dates",
      "gallery",
      "address",
    ],
    2: ["bedrooms", "beds", "max_guests", "bathrooms", "amenities"],
    3: [
      "price_per_night",
      "cleaning_fee",
      "service_fee",
      "weekly_discount",
      "monthly_discount",
      "weekend_price",
      "discount_first_booking",
    ],
    4: [
      "house_rules",
      "cancellation_policy",
      "safety_and_property",
      "check_in_time",
      "check_out_time",
    ],
    5: ["is_self_checkin", "pet_allowed", "notes"],
    6: ["status", "isDraft"],
  };

  if (!stepUpdates[step]) return next(new ErrorHandler("Invalid step", 400));

  let updatedFields = stepUpdates[step].reduce((acc, field) => {
    if (propertyData[field] !== undefined) acc[field] = propertyData[field];
    return acc;
  }, {});

  if (step === 6) {
    updatedFields.status = "active";
    updatedFields.isDraft = false;
  }

  let property;

  if (id) {
    property = await Property.findById(id);
    if (!property) return next(new ErrorHandler("Property not found", 404));

    updatedFields.draft_steps_completed = Math.max(
      property.draft_steps_completed || 0,
      step
    );

    property = await Property.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true }
    ).lean();
  } else {
    if (step !== 1) return next(new ErrorHandler("Invalid step", 400));
    // Validate Host before Creating Property
    const hostExists = await User.findById(req.user._id);
    if (!hostExists) return next(new ErrorHandler("Invalid host ID", 400));

    property = await Property.create({
      ...updatedFields,
      host_id: req.user._id,
      isDraft: true,
      draft_steps_completed: step,
    });
  }

  return ResponseHandler.send(
    res,
    "Property saved successfully",
    property,
    200
  );
});

export const editProperty = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  console.log(req.body);
  const { step, ...propertyData } = req.body;

  // Find existing property
  let property = await Property.findById(id);
  if (!property) return next(new ErrorHandler("Property not found", 404));

  // Define allowed step updates
  const stepUpdates = {
    1: [
      "category",
      "title",
      "property_type",
      "description",
      "type_of_place",
      "availability_dates",
      "gallery",
      "address",
    ],
    2: ["bedrooms", "beds", "max_guests", "bathrooms", "amenities"],
    3: [
      "price_per_night",
      "cleaning_fee",
      "service_fee",
      "weekly_discount",
      "monthly_discount",
      "weekend_price",
      "discount_first_booking",
    ],
    4: [
      "house_rules",
      "cancellation_policy",
      "safety_and_property",
      "check_in_time",
      "check_out_time",
    ],
    5: ["is_self_checkin", "pet_allowed", "notes"],
  };

  if (!stepUpdates[step]) return next(new ErrorHandler("Invalid step", 400));

  // Only update fields relevant to the step
  let updatedFields = stepUpdates[step].reduce((acc, field) => {
    if (propertyData[field] !== undefined) acc[field] = propertyData[field];
    return acc;
  }, {});

  // Update property
  property = await Property.findByIdAndUpdate(
    id,
    { $set: updatedFields },
    { new: true }
  ).lean();

  return ResponseHandler.send(
    res,
    "Property updated successfully",
    property,
    200
  );
});

// get all active properties only
export const getProperties = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user?._id; // Get logged-in user ID
  const properties = await Property.find({ status: "active" });

  let wishlistPropertyIds = [];

  if (userId) {
    const wishlist = await Wishlists.find({ userId }).select("propertyId");
    wishlistPropertyIds = wishlist.map((item) => item.propertyId.toString());
  }

  // Add isWishlisted flag to each property
  const updatedProperties = properties.map((property) => ({
    ...property._doc, // Spread property data
    isWishlisted: wishlistPropertyIds.includes(property._id.toString()),
  }));

  return ResponseHandler.send(res, "Properties", updatedProperties, 200);
});

export const getMyProperties = catchAsyncErrors(async (req, res, next) => {
  const properties = await Property.find({ host_id: req.user._id }).lean();
  return ResponseHandler.send(res, "My Properties", properties, 200);
});
export const getMyPropertyById = catchAsyncErrors(async (req, res, next) => {
  const property = await Property.findById(req.params.id).lean();
  if (!property) return next(new ErrorHandler("Property not found", 404));
  return ResponseHandler.send(res, "Property details", property, 200);
});

export const getPropertyById = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user?._id; // Get logged-in user ID (null if not authenticated)

  // Fetch property details
  const property = await Property.findOne({
    _id: req.params.id,
    status: "active",
  })
    .populate({
      path: "host_id",
      select: "first_name last_name _id createdAt",
    })
    .lean();

  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  // Fetch property reservations (to get unavailable dates)
  const reservations = await Reservation.find({
    propertyId: req.params.id,
  }).select("selectedDates");

  const not_availability_dates = reservations.map(({ selectedDates }) => [
    selectedDates.checkIn.toISOString().split("T")[0],
    selectedDates.checkOut.toISOString().split("T")[0],
  ]);

  // Check if property is in the user's wishlist
  let isWishlisted = false;
  if (userId) {
    const wishlist = await Wishlists.findOne({
      userId,
      propertyId: property._id,
    });

    if (wishlist) {
      isWishlisted = true;
    }
  }

  // Return full property details with wishlist status
  return ResponseHandler.send(
    res,
    "Property details",
    { ...property, not_availability_dates, isWishlisted },
    200
  );
});

export const calculateBookingPrice = async (req, res, next) => {
  try {
    const { id: propertyId } = req.params;
    const { checkIn, checkOut } = req.query;

    const property = await Property.findById(propertyId);
    if (!property) return next(new ErrorHandler("Property not found", 404));

    if (!property.isAvailable(checkIn, checkOut)) {
      return next(
        new ErrorHandler(
          "Sorry, no availability for this property on the selected dates",
          400
        )
      );
    }
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const numberOfNights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    if (numberOfNights <= 0)
      return next(new ErrorHandler("Invalid check-in/check-out dates", 400));

    // Check if the dates are available
    const isUnavailable = await Reservation.exists({
      propertyId,
      $or: [
        {
          "selectedDates.checkIn": { $lt: checkOutDate },
          "selectedDates.checkOut": { $gt: checkInDate },
        },
        { "selectedDates.checkIn": { $gte: checkInDate, $lt: checkOutDate } },
        { "selectedDates.checkOut": { $gt: checkInDate, $lte: checkOutDate } },
      ],
    });

    if (isUnavailable)
      return next(new ErrorHandler("Selected dates are unavailable", 400));

    // 🔹 Count existing bookings for first 3 bookings discount
    const existingBookings = await Reservation.countDocuments({ propertyId });

    let basePrice = 0;

    // 🔹 Calculate total base price based on weekend rates
    for (let i = 0; i < numberOfNights; i++) {
      const date = new Date(checkInDate);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay(); // 0 (Sunday) - 6 (Saturday)

      // If weekend, use weekend_price; otherwise, use standard price_per_night
      basePrice +=
        dayOfWeek === 0 || dayOfWeek === 6 // Check for Sat-Sun
          ? property.weekend_price || property.price_per_night
          : property.price_per_night;
    }

    let discount = 0;

    // 🔹 First 3 bookings get 33% discount (if enabled)
    if (property.discount_first_booking && existingBookings < 3) {
      discount = basePrice * 0.33;
    } else {
      // 🔹 Apply weekly (10%) / monthly (20%) discounts only if first 3 discount is not applied
      if (numberOfNights > 30) discount = basePrice * 0.2; // 20% for long stays
      else if (numberOfNights > 6) discount = basePrice * 0.1; // 10% for weekly stays
    }
    const discountType =
      existingBookings < 3
        ? "first_booking_3_discount"
        : "weekly_monthly_discount";

    const totalPrice =
      basePrice -
      discount +
      (property.cleaning_fee || 0) +
      (property.service_fee || 0);

    return res.status(200).json({
      success: true,
      data: {
        numberOfNights,
        basePrice,
        discount,
        discountType,
        cleaningFee: property.cleaning_fee,
        serviceFee: property.service_fee,
        totalPrice,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteProperty = catchAsyncErrors(async (req, res, next) => {
  const property = await Property.deleteOne({
    host_id: req.user._id,
    _id: req.params.id, // Correctly specifying the property ID
  });

  if (property.deletedCount === 0) {
    return next(new ErrorHandler("Property not found", 404));
  }
  return ResponseHandler.send(res, "Property deleted successfully", {}, 200);
});

// create Amenities
export const createAmenities = catchAsyncErrors(async (req, res, next) => {
  const { title, description, amenities } = req.body;

  if (!title || !amenities || !Array.isArray(amenities)) {
    return next(
      new ErrorHandler("Title and amenities (array) are required", 400)
    );
  }

  const newAmenities = await Amenities.create({
    title,
    description,
    amenities,
  });

  return ResponseHandler.send(
    res,
    "Amenities created successfully",
    newAmenities,
    201
  );
});

//update Amenities
export const updateAmenities = catchAsyncErrors(async (req, res, next) => {
  const amenities = await Amenities.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!amenities) return next(new ErrorHandler("Amenities not found", 404));
  return ResponseHandler.send(
    res,
    "Amenities updated successfully",
    amenities,
    200
  );
});

// delete Amenities
export const deleteAmenities = catchAsyncErrors(async (req, res, next) => {
  const amenities = await Amenities.findById(req.params.id);
  if (!amenities) return next(new ErrorHandler("Amenities not found", 404));
  await Amenities.deleteOne({ _id: req.params.id });
  return ResponseHandler.send(
    res,
    "Amenities deleted successfully",
    amenities,
    200
  );
});

// get all amenities
export const getAmenities = catchAsyncErrors(async (req, res, next) => {
  const amenities = await Amenities.find({});
  return ResponseHandler.send(res, "Amenities", amenities, 200);
});

// create a new category
export const createCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.create(req.body);
  return ResponseHandler.send(
    res,
    "Category created successfully",
    category,
    201
  );
});

// update a category
export const updateCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  if (!category) return next(new ErrorHandler("Category not found", 404));
  return ResponseHandler.send(
    res,
    "Category updated successfully",
    category,
    200
  );
});

// delete a category
export const deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorHandler("Category not found", 404));
  await Category.deleteOne({ _id: req.params.id });
  return ResponseHandler.send(
    res,
    "Category deleted successfully",
    category,
    200
  );
});

// get all categories
export const getCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = await Category.find({});
  return ResponseHandler.send(res, "Categories", categories, 200);
});

// add Wishlist
export const addToWishlist = catchAsyncErrors(async (req, res, next) => {
  const { propertyId } = req.params;
  console.log("propertyId:", req.params);

  if (!propertyId) {
    return next(new ErrorHandler("Property ID is required", 400));
  }

  const existingWishlist = await Wishlists.findOne({
    userId: req.user._id,
    propertyId: propertyId,
  });

  if (existingWishlist) {
    return next(new ErrorHandler("Property already in wishlist", 400));
  }

  const newWishlist = await Wishlists.create({
    userId: req.user._id,
    propertyId: propertyId,
  });

  return ResponseHandler.send(
    res,
    "Property added to wishlist successfully",
    newWishlist,
    201
  );
});

// remove Wishlist
export const removeFromWishlist = catchAsyncErrors(async (req, res, next) => {
  const { propertyId } = req.params;
  console.log("propertyId:", req.params);

  if (!propertyId) {
    return next(new ErrorHandler("Property ID is required", 400));
  }

  const wishlist = await Wishlists.findOneAndDelete({
    userId: req.user._id,
    propertyId: propertyId,
  });

  if (!wishlist) {
    return next(new ErrorHandler("Property not in wishlist", 404));
  }

  return ResponseHandler.send(
    res,
    "Property removed from wishlist successfully",
    wishlist,
    200
  );
});

// get all Wishlist
export const getWishlist = catchAsyncErrors(async (req, res, next) => {
  const wishlists = await Wishlists.find({ userId: req.user._id }).populate({
    path: "propertyId",
    select: "title price_per_night bedrooms bathrooms _id gallery tags",
  });
  const wishlistWithFlag = wishlists.map((wishlist) => ({
    ...wishlist.propertyId.toObject(), // Convert to plain object
    isWishlisted: true, // Add isWishlisted flag
  }));

  return ResponseHandler.send(res, "Wishlist", wishlistWithFlag, 200);
});
