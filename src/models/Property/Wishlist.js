import { mongoose, Schema } from "mongoose";

const WishlistSchema = new mongoose.Schema({
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
});
// unique property
WishlistSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
WishlistSchema.index({ userId: 1 });

export default mongoose.model("Wishlists", WishlistSchema);
