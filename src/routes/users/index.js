import { Router } from "express";
import {
  forgotPassword,
  getUser,
  login,
  resetPassword,
  signup,
  updateProfile,
  verify,
  verifyOTP,
} from "../../controllers/User/auth.controller.js";
import { isAuthenticatedUser } from "../../middleware/auth.js";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../../controllers/property/property.controller.js";
import { userDetails } from "../../controllers/User/user.controller.js";
import { postReview } from "../../controllers/User/user.review.controller.js";

const router = Router();

router.post("/verify", verify);
router.post("/login", login);
router.post("/signup", signup);
router.get("/me", isAuthenticatedUser, getUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/:propertyId/wishlist", isAuthenticatedUser, addToWishlist);
router.delete("/:propertyId/wishlist", isAuthenticatedUser, removeFromWishlist);
router.get("/wishlist", isAuthenticatedUser, getWishlist);
router.get("/:id", userDetails);
router.put("/update", isAuthenticatedUser, updateProfile);

// Reviews
router.post("/review/:propertyId", isAuthenticatedUser, postReview);

export default router;
