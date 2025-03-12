import { Router } from "express";
import {
  addProperty,
  deleteProperty,
  editProperty,
  getMyProperties,
  getMyPropertyById,
  getProperties,
  getPropertyById,
} from "../../controllers/property/property.controller.js";
import { authorizeRoles, isAuthenticatedUser } from "../../middleware/auth.js";

const router = Router();

router.post("/add", isAuthenticatedUser, addProperty);
router.put("/:id", isAuthenticatedUser, editProperty);
router.delete("/:id", isAuthenticatedUser, deleteProperty);
router.get("/my", isAuthenticatedUser, getMyProperties);
router.get("/my/:id", isAuthenticatedUser, getMyPropertyById);
router.get("/all", getProperties);
router.get("/:id", getPropertyById);

export default router;
