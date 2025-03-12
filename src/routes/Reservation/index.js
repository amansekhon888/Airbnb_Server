import { Router } from "express";
const router = Router();

router.route("/").post(getCategories)

export default router;
