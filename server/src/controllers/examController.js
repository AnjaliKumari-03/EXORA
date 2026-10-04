import mongoose from "mongoose";
import Exam from "../models/Exam.js";
import Result from "../models/Result.js";
import Attempt from "../models/Attempt.js";
import { extractText } from "../services/fileParserService.js";
import { extractPdfPages } from "../services/pdfToImagesService.js";
import { extractQuestionsFromPdfPages } from "../services/pdfBatchExtractionService.js";
import { extractQuestionsWithAI } from "../services/aiQuestionExtractorService.js";
import { extractQuestions as extractQuestionsWithRegex } from "../services/questionExtractorService.js";

export async function parseUploadedExam(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const { draftQuestions, usedFallback } =
      req.file.mimetype === "application/pdf"
        ? await parsePdf(req.file.buffer)
        : await parseNonPdf(req.file.buffer, req.file.mimetype);

    res.json({
      fileName: req.file.originalname,
      questionCount: draftQuestions.length,
      usedFallback,
      draftQuestions,
    });
  } catch (err) {
    console.error("Exam parse failed:", err);
    res
      .status(422)
      .json({ message: "Could not parse this file", detail: err.message });
  }
}

async function parsePdf(buffer) {
  const pages = extractPdfPages(buffer);
  const { questions, usedFallback } = await extractQuestionsFromPdfPages(pages);
  return { draftQuestions: questions, usedFallback };
}

async function parseNonPdf(buffer, mimetype) {
  const rawText = await extractText(buffer, mimetype);
  try {
    const draftQuestions = await extractQuestionsWithAI(rawText, []);
    return { draftQuestions, usedFallback: false };
  } catch (err) {
    console.warn(
      "Gemini extraction failed, falling back to regex parser:",
      err.message,
    );
    const draftQuestions = extractQuestionsWithRegex(rawText);
    return { draftQuestions, usedFallback: true };
  }
}

export async function createExam(req, res) {
  const {
    title,
    category,
    navigationMode,
    restrictSectionNavigation,
    totalDurationSeconds,
    sections,
  } = req.body;

  if (
    !title ||
    !totalDurationSeconds ||
    !Array.isArray(sections) ||
    sections.length === 0
  ) {
    return res.status(400).json({ message: "Missing required exam fields" });
  }

  const exam = new Exam({
    ownerId: req.user._id,
    title,
    category: category || "",
    navigationMode,
    restrictSectionNavigation: Boolean(restrictSectionNavigation),
    totalDurationSeconds,
    sections: sections.map((section) => ({
      title: section.title,
      durationSeconds: section.durationSeconds,
      questions: section.questions.map((q) => ({
        type: q.type,
        text: q.text,
        imageData: q.imageData || null,
        options: q.options,
        correctNumericalAnswer:
          q.type === "numerical" ? q.correctNumericalAnswer : null,
        positiveMarks: q.positiveMarks,
        negativeMarks:
          q.type === "numerical" ? (q.negativeMarks ?? 0) : q.negativeMarks,
      })),
    })),
  });

  sections.forEach((section, sectionIndex) => {
    section.questions.forEach((q, questionIndex) => {
      if (q.type === "numerical") return;
      const savedQuestion =
        exam.sections[sectionIndex].questions[questionIndex];
      savedQuestion.correctOptionIds = q.correctOptionIndexes.map(
        (optionIndex) => savedQuestion.options[optionIndex]._id,
      );
    });
  });

  await exam.save();
  res.status(201).json({ examId: exam._id });
}

export async function getExamForEdit(req, res) {
  const { examId } = req.params;

  try {
    const exam = await Exam.findOne({ _id: examId, ownerId: req.user._id });
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json({
      id: exam._id,
      title: exam.title,
      category: exam.category || "",
      navigationMode: exam.navigationMode,
      restrictSectionNavigation: exam.restrictSectionNavigation,
      totalDurationSeconds: exam.totalDurationSeconds,
      sections: exam.sections.map((section) => ({
        id: section._id,
        title: section.title,
        durationSeconds: section.durationSeconds,
        questions: section.questions.map((q) => ({
          id: q._id,
          type: q.type,
          text: q.text,
          imageData: q.imageData,
          options: q.options.map((opt) => ({ id: opt._id, text: opt.text })),
          correctOptionIndexes:
            q.type === "numerical"
              ? []
              : q.options
                  .map((opt, i) =>
                    q.correctOptionIds.some((id) => id.equals(opt._id))
                      ? i
                      : -1,
                  )
                  .filter((i) => i !== -1),
          correctNumericalAnswer: q.correctNumericalAnswer,
          positiveMarks: q.positiveMarks,
          negativeMarks: q.negativeMarks,
        })),
      })),
    });
  } catch (err) {
    console.error("getExamForEdit failed:", err);
    res
      .status(400)
      .json({ message: "Could not load this exam", detail: err.message });
  }
}

export async function updateExam(req, res) {
  const { examId } = req.params;
  const {
    title,
    category,
    navigationMode,
    restrictSectionNavigation,
    totalDurationSeconds,
    sections,
  } = req.body;

  if (
    !title ||
    !totalDurationSeconds ||
    !Array.isArray(sections) ||
    sections.length === 0
  ) {
    return res.status(400).json({ message: "Missing required exam fields" });
  }

  try {
    const exam = await Exam.findOne({ _id: examId, ownerId: req.user._id });
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    exam.title = title;
    exam.category = category || "";
    exam.navigationMode = navigationMode;
    exam.restrictSectionNavigation = Boolean(restrictSectionNavigation);
    exam.totalDurationSeconds = totalDurationSeconds;
    exam.sections = sections.map((section) => ({
      ...idIfExisting(section.id),
      title: section.title,
      durationSeconds: section.durationSeconds,
      questions: section.questions.map((q) => ({
        ...idIfExisting(q.id),
        type: q.type,
        text: q.text,
        imageData: q.imageData || null,
        options:
          q.type === "numerical"
            ? []
            : q.options.map((opt) => ({
                ...idIfExisting(opt.id),
                text: opt.text,
              })),
        correctNumericalAnswer:
          q.type === "numerical" ? q.correctNumericalAnswer : null,
        positiveMarks: q.positiveMarks,
        negativeMarks:
          q.type === "numerical" ? (q.negativeMarks ?? 0) : q.negativeMarks,
      })),
    }));

    sections.forEach((section, sectionIndex) => {
      section.questions.forEach((q, questionIndex) => {
        if (q.type === "numerical") return;
        const savedQuestion =
          exam.sections[sectionIndex].questions[questionIndex];
        savedQuestion.correctOptionIds = q.correctOptionIndexes.map(
          (optionIndex) => savedQuestion.options[optionIndex]._id,
        );
      });
    });

    await exam.save();
    res.json({ examId: exam._id });
  } catch (err) {
    console.error("updateExam failed:", err);
    res.status(400).json({
      message: "Could not save changes to this exam",
      detail: err.message,
    });
  }
}

function idIfExisting(id) {
  return mongoose.Types.ObjectId.isValid(id) ? { _id: id } : {};
}

export async function deleteExam(req, res) {
  const { examId } = req.params;

  try {
    const exam = await Exam.findOne({ _id: examId, ownerId: req.user._id });
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    await Attempt.deleteMany({ examId });
    await Result.deleteMany({ examId });
    await exam.deleteOne();

    res.json({ message: "Exam and all related results deleted" });
  } catch (err) {
    console.error("deleteExam failed:", err);
    res
      .status(400)
      .json({ message: "Could not delete this exam", detail: err.message });
  }
}

export async function listMyExams(req, res) {
  const exams = await Exam.find({ ownerId: req.user._id })
    .select("title category createdAt totalDurationSeconds sections")
    .sort({ createdAt: -1 });

  const results = await Result.find({ userId: req.user._id })
    .select("examId createdAt")
    .sort({ createdAt: -1 });

  const lastResultIdByExam = new Map();
  for (const result of results) {
    const key = result.examId.toString();
    if (!lastResultIdByExam.has(key)) {
      lastResultIdByExam.set(key, result._id);
    }
  }

  const summaries = exams.map((exam) => ({
    id: exam._id,
    title: exam.title,

    category: exam.category || "Uncategorized",
    createdAt: exam.createdAt,
    totalDurationSeconds: exam.totalDurationSeconds,
    questionCount: exam.sections.reduce(
      (count, section) => count + section.questions.length,
      0,
    ),
    lastResultId: lastResultIdByExam.get(exam._id.toString()) || null,
  }));

  res.json({ exams: summaries });
}

export async function listExamResults(req, res) {
  const { examId } = req.params;

  try {
    const exam = await Exam.findOne({
      _id: examId,
      ownerId: req.user._id,
    }).select("title");
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const results = await Result.find({ examId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    const attempts = await Attempt.find({
      _id: { $in: results.map((r) => r.attemptId) },
    }).select("submittedAt autoSubmitted integrityEvents");
    const attemptById = new Map(attempts.map((a) => [a._id.toString(), a]));

    res.json({
      examId: exam._id,
      examTitle: exam.title,
      results: results.map((result) => {
        const attempt = attemptById.get(result.attemptId.toString());
        return {
          resultId: result._id,
          studentName: result.userId?.name || "Unknown student",
          studentEmail: result.userId?.email || "",
          totalScore: result.totalScore,
          maxPossibleScore: result.maxPossibleScore,
          submittedAt: attempt?.submittedAt ?? result.createdAt,
          autoSubmitted: attempt?.autoSubmitted ?? false,
          integrityViolationCount: attempt?.integrityEvents?.length ?? 0,
        };
      }),
    });
  } catch (err) {
    console.error("listExamResults failed:", err);
    res.status(400).json({
      message: "Could not load results for this exam",
      detail: err.message,
    });
  }
}
