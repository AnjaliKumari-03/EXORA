import Result from "../models/Result.js";
import Exam from "../models/Exam.js";
import Attempt from "../models/Attempt.js";
import { numericalAnswersMatch } from "../services/answerMatching.js";
import { buildInsights } from "../services/insightService.js";

export async function getResult(req, res) {
  const { resultId } = req.params;

  try {
    const result = await Result.findById(resultId);
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const exam = await Exam.findById(result.examId);
    const isOwnResult = result.userId.equals(req.user._id);
    const isExamOwner = exam?.ownerId?.equals(req.user._id);
    if (!isOwnResult && !isExamOwner) {
      return res.status(404).json({ message: "Result not found" });
    }

    const attempt = await Attempt.findById(result.attemptId);

    const sections = exam.sections.map((section) => ({
      title: section.title,
      questions: section.questions.map((q) => buildQuestionReview(q, attempt)),
    }));

    res.json({
      examTitle: exam.title,
      result: {
        totalScore: result.totalScore,
        maxPossibleScore: result.maxPossibleScore,
        correctCount: result.correctCount,
        wrongCount: result.wrongCount,
        skippedCount: result.skippedCount,
        sectionScores: result.sectionScores,
      },
      sections,
      insights: buildInsights(exam, attempt, result),
    });
  } catch (err) {
    console.error("getResult failed:", err);
    res
      .status(400)
      .json({ message: "Could not load this result", detail: err.message });
  }
}

function buildQuestionReview(question, attempt) {
  const answer = attempt.answers.get(question._id.toString());

  return {
    id: question._id,
    type: question.type,
    text: question.text,
    imageData: question.imageData,
    options: question.options.map((opt) => ({
      id: opt._id.toString(),
      text: opt.text,
    })),
    selectedOptionIds: (answer?.selectedOptionIds || []).map((id) =>
      id.toString(),
    ),
    correctOptionIds: question.correctOptionIds.map((id) => id.toString()),
    numericalAnswer: answer?.numericalAnswer ?? null,
    correctNumericalAnswer: question.correctNumericalAnswer,

    isNumericalCorrect:
      question.type === "numerical"
        ? numericalAnswersMatch(
            answer?.numericalAnswer,
            question.correctNumericalAnswer,
          )
        : null,
  };
}
