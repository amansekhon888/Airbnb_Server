import { Router } from "express";
import {
    getAmenities,
  getCategories,
} from "../../controllers/property/property.controller.js";
const router = Router();

router.route("/categories").get(getCategories)
router.route("/amenities").get(getAmenities)

export default router;
