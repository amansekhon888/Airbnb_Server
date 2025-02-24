import { Router } from "express";
import {
    forgotPassword,
    getUser,
  login,
  resetPassword,
  signup,
  verify,
  verifyOTP,
} from "../../controllers/User/auth.controller.js";
import { isAuthenticatedUser } from "../../middleware/auth.js";

const router = Router();

router.post("/verify", verify);
router.post("/login", login);
router.post("/signup", signup);
router.get("/me", isAuthenticatedUser, getUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;
