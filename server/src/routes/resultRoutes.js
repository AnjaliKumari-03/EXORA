import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getResult } from "../controllers/resultController.js";

const router = Router();

router.get("/:resultId", requireAuth, getResult);

export default router;
