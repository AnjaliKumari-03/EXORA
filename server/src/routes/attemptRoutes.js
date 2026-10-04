import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  startAttempt,
  startSection,
  saveAnswer,
  submitAttempt,
  logIntegrityEvent,
} from "../controllers/attemptController.js";

const router = Router();

router.post("/:examId/start", requireAuth, startAttempt);
router.post("/:attemptId/section/:sectionId/start", requireAuth, startSection);
router.post("/:attemptId/answer", requireAuth, saveAnswer);
router.post("/:attemptId/integrity", requireAuth, logIntegrityEvent);
router.post("/:attemptId/submit", requireAuth, submitAttempt);

export default router;
