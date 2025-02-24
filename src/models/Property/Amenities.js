import mongoose from "mongoose";

const AmenitiesSchema = new mongoose.Schema({
  title: String,
  description: String,
  amenities: String
});

export default mongoose.model("Amenities", AmenitiesSchema);
