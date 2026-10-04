import { Router } from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  parseUploadedExam,
  createExam,
  listMyExams,
  getExamForEdit,
  updateExam,
  deleteExam,
  listExamResults,
} from "../controllers/examController.js";

const router = Router();

router.post("/parse", requireAuth, upload.single("file"), parseUploadedExam);
router.post("/", requireAuth, createExam);
router.get("/", requireAuth, listMyExams);
router.get("/:examId/edit", requireAuth, getExamForEdit);
router.put("/:examId", requireAuth, updateExam);
router.delete("/:examId", requireAuth, deleteExam);
router.get("/:examId/results", requireAuth, listExamResults);

export default router;
