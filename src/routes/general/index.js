import { Router } from "express";
import {
    getAmenities,
  getCategories,
} from "../../controllers/property/property.controller.js";
import upload from "../../middleware/multer.js";
import { uploadMultipleImages, uploadSingleImage } from "../../controllers/Upload/upload.controller.js";
const router = Router();

router.route("/categories").get(getCategories)
router.route("/amenities").get(getAmenities)

router.post("/upload-single", upload.single("image"), uploadSingleImage);
router.post("/upload-multiple", upload.array("images"), uploadMultipleImages);

export default router;
