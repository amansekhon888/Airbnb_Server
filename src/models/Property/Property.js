import mongoose from "mongoose";
import { isPropertyAvailable } from "../../controllers/property/utils/property.utils.js";

const PropertySchema = new mongoose.Schema(
  {
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    title: String,
    property_type: {
      type: String,
      enum: ["apartment", "house", "villa", "condo", "studio"],
    },
    description: String,
    type_of_place: {
      type: String,
      enum: ["any", "room", "home"],
    },
    availability_dates: {
      start_date: Date,
      end_date: Date,
    },
    availability_period: {
      type: Number,
      enum: ["3", "6", "9", "12", "24"],
    },
    isBooking: Boolean,
    gallery: [
      {
        url: String,
        caption: String,
        isPrimary: Boolean,
      },
    ],
    address: {
      address: String,
      city: String,
      state: String,
      country: String,
      zip_code: String,
      latitude: Number,
      longitude: Number,
    },
    price_per_night: Number,
    cleaning_fee: Number,
    service_fee: Number,
    weekly_discount: Number,
    monthly_discount: Number,
    weekend_price: Number,
    discount_first_booking: Boolean,
    bedrooms: Number,
    beds: Number,
    max_guests: Number,
    bathrooms: Number,
    amenities: [String],
    house_rules: String,
    cancellation_policy: {
      type: {
        type: String,
        enum: ["flexible", "moderate", "non-refundable"],
      },
      description: String,
    },
    safety_and_property: String,
    check_in_time: {
      type: String,
    },
    check_out_time: {
      type: String,
    },
    is_self_checkin: Boolean,
    pet_allowed: Boolean,
    notes: {
      general_note: {
        type: String,
        default: "",
      },
      attraction_note: {
        type: String,
        default: "",
      },
    },
    tags: {
      type: String,
      enum: ["superhost", "popular", "featured", "new"],
      default: "new",
    },
    avgRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "draft",
    },
    isDraft: Boolean,
    draft_steps_completed: {
      type: Number,
    },
  },
  { timestamps: true }
);

PropertySchema.methods.isAvailable = async function (checkIn, checkOut) {
  return await isPropertyAvailable(this, checkIn, checkOut);
};

export default mongoose.model("Properties", PropertySchema);
