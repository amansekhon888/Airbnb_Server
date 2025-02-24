import { Router } from "express";
import { addProperty } from "../../controllers/User/property.controller.js";
import { isAuthenticatedUser } from "../../middleware/auth.js";

const router = Router();

router.post("/add", isAuthenticatedUser, addProperty);

export default router;
