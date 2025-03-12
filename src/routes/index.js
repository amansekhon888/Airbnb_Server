import { Router } from "express";
import userRoutes from "./users/index.js"
import PropertyRoutes from "./property/index.js"
import AdminRoutes from "./admin/index.js"
import GeneralRoutes from "./general/index.js"
import Reservation from "./Reservation/index.js"
import { authorizeRoles, isAuthenticatedUser } from "../middleware/auth.js";
const router = Router();

router.use("/users", userRoutes)
router.use("/property", PropertyRoutes)
router.use("/admin", isAuthenticatedUser, authorizeRoles("admin"), AdminRoutes)
router.use("/", GeneralRoutes)
router.use("/reservation", Reservation)

export default router;