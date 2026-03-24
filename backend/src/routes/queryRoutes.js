import { Router } from "express";
import {
  createQuery,
  deleteQuery,
  getQueries,
  updateQuery,
} from "../controllers/queryController.js";
import { optionalAuth, requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", optionalAuth, getQueries);
router.post("/", optionalAuth, createQuery);
router.put("/:id", requireAuth, updateQuery);
router.delete("/:id", requireAuth, deleteQuery);

export default router;
