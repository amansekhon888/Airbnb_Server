import { Router } from "express";
import {
    createAmenities,
  createCategory,
  deleteAmenities,
  deleteCategory,
  updateAmenities,
  updateCategory,
} from "../../controllers/property/property.controller.js";
const router = Router();

router.post("/create-category", createCategory);
router.route("/category/:id").put(updateCategory).delete(deleteCategory);
router.post("/create-amenities", createAmenities);
router.route("/amenity/:id").put(updateAmenities).delete(deleteAmenities);

export default router;
