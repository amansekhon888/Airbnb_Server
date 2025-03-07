import User from "../../models/User/User.js";
import Property from "../../models/Property/Property.js";
import Amenities from "../../models/Property/Amenities.js";
import Category from "../../models/Property/Category.js";
import { catchAsyncErrors } from "../../middleware/catchAsyncErrors.js";
import ErrorHandler from "../../Utils/errorhandler.js";
import ResponseHandler from "../../Utils/resHandler.js";

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
  const { id, step, ...propertyData } = req.body;

  if (!id) return next(new ErrorHandler("Property ID is required", 400));

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
  const properties = await Property.find({ status: "active" });
  return ResponseHandler.send(res, "Properties", properties, 200);
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
  const property = await Property.findOne({
    _id: req.params.id,
    status: "active",
  }).lean();
  console.log(property);

  if (!property) return next(new ErrorHandler("Property not found", 404));
  return ResponseHandler.send(res, "Property details", property, 200);
});

export const deleteProperty = catchAsyncErrors(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) return next(new ErrorHandler("Property not found", 404));

  await property.remove();
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
