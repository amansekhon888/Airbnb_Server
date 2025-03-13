import { Router } from "express";
import { createReservation } from "../../controllers/Reservation/reservation.controller.js";
import { isAuthenticatedUser } from "../../middleware/auth.js";
const router = Router();

router.post("/", isAuthenticatedUser, createReservation);

export default router;
