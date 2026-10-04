import Exam from "../models/Exam.js";
import Attempt from "../models/Attempt.js";
import Result from "../models/Result.js";
import { sanitizeExamForAttempt } from "../services/sanitizeExamService.js";
import {
  buildShuffledQuestionOrder,
  buildShuffledOptionOrders,
} from "../services/shuffleService.js";
import { gradeAttempt } from "../services/gradingService.js";

export async function startAttempt(req, res) {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  let attempt = await Attempt.findOne({
    examId,
    userId: req.user._id,
    submittedAt: null,
  });
  if (!attempt) {
    attempt = await Attempt.create({
      examId,
      userId: req.user._id,
      startedAt: new Date(),
      questionOrder: buildShuffledQuestionOrder(exam),
      optionOrders: buildShuffledOptionOrders(exam),
      sectionStartedAt: { [exam.sections[0]._id.toString()]: new Date() },
    });
  }

  res.json({
    attemptId: attempt._id,
    startedAt: attempt.startedAt,
    answers: Object.fromEntries(attempt.answers),
    sectionStartedAt: Object.fromEntries(attempt.sectionStartedAt),
    exam: sanitizeExamForAttempt(
      exam,
      attempt.questionOrder,
      attempt.optionOrders,
    ),
  });
}

export async function startSection(req, res) {
  const { attemptId, sectionId } = req.params;

  const attempt = await Attempt.findOne({
    _id: attemptId,
    userId: req.user._id,
    submittedAt: null,
  });
  if (!attempt) {
    return res
      .status(404)
      .json({ message: "Attempt not found or already submitted" });
  }

  if (!attempt.sectionStartedAt.has(sectionId)) {
    attempt.sectionStartedAt.set(sectionId, new Date());
    attempt.markModified("sectionStartedAt");
    await attempt.save();
  }

  res.json({ startedAt: attempt.sectionStartedAt.get(sectionId) });
}

export async function saveAnswer(req, res) {
  const { attemptId } = req.params;
  const { questionId, selectedOptionIds, numericalAnswer, status } = req.body;

  const attempt = await Attempt.findOne({
    _id: attemptId,
    userId: req.user._id,
    submittedAt: null,
  });
  if (!attempt) {
    return res
      .status(404)
      .json({ message: "Attempt not found or already submitted" });
  }

  attempt.answers.set(questionId, {
    selectedOptionIds,
    numericalAnswer,
    status,
  });
  attempt.markModified("answers");
  await attempt.save();

  res.json({ message: "Saved" });
}

const INTEGRITY_EVENT_TYPES = new Set([
  "tab-switch",
  "window-blur",
  "fullscreen-exit",
]);

export async function logIntegrityEvent(req, res) {
  const { attemptId } = req.params;
  const { type } = req.body;

  if (!INTEGRITY_EVENT_TYPES.has(type)) {
    return res.status(400).json({ message: "Unknown integrity event type" });
  }

  const attempt = await Attempt.findOne({
    _id: attemptId,
    userId: req.user._id,
    submittedAt: null,
  });
  if (!attempt) {
    return res
      .status(404)
      .json({ message: "Attempt not found or already submitted" });
  }

  attempt.integrityEvents.push({ type, occurredAt: new Date() });
  await attempt.save();

  res.json({ count: attempt.integrityEvents.length });
}

export async function submitAttempt(req, res) {
  const { attemptId } = req.params;
  const { autoSubmitted } = req.body;

  const attempt = await Attempt.findOne({
    _id: attemptId,
    userId: req.user._id,
    submittedAt: null,
  });
  if (!attempt) {
    return res
      .status(404)
      .json({ message: "Attempt not found or already submitted" });
  }

  attempt.submittedAt = new Date();
  attempt.autoSubmitted = Boolean(autoSubmitted);
  await attempt.save();

  const exam = await Exam.findById(attempt.examId);
  const graded = gradeAttempt(exam, attempt);
  const result = await Result.create({
    attemptId: attempt._id,
    examId: attempt.examId,
    userId: req.user._id,
    ...graded,
  });

  res.json({ message: "Submitted", resultId: result._id });
}
