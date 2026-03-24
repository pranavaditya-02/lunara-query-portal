import { Router } from "express";
import { login, logout, me } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/logout", logout);

export default router;
