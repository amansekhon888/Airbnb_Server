import { Router } from "express";
import userRoutes from "./users/index.js"
import PropertyRoutes from "./property/index.js"
const router = Router();

router.use("/users", userRoutes)
router.use("/property", PropertyRoutes)

export default router;