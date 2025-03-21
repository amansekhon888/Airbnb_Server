import { mongoose } from "mongoose";

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Properties",
    required: true,
  },
  content: {
    type: String,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
},
  { timestamps: true }
);
// unique property
ReviewSchema.index({ propertyId: 1, userId: 1 }, { unique: true });
ReviewSchema.index({ propertyId: 1 });

export default mongoose.model("Reviews", ReviewSchema);
