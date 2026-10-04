import { numericalAnswersMatch } from "./answerMatching.js";

export function gradeAttempt(exam, attempt) {
  let totalScore = 0;
  let maxPossibleScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  const sectionScores = [];

  for (const section of exam.sections) {
    const sectionResult = gradeSection(section, attempt);
    sectionScores.push(sectionResult.summary);
    totalScore += sectionResult.summary.score;
    maxPossibleScore += sectionResult.maxPossibleScore;
    correctCount += sectionResult.summary.correctCount;
    wrongCount += sectionResult.summary.wrongCount;
    skippedCount += sectionResult.summary.skippedCount;
  }

  return {
    totalScore,
    maxPossibleScore,
    correctCount,
    wrongCount,
    skippedCount,
    sectionScores,
  };
}

function gradeSection(section, attempt) {
  let score = 0;
  let maxPossibleScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  for (const question of section.questions) {
    maxPossibleScore += question.positiveMarks;
    const answer = attempt.answers.get(question._id.toString());
    const outcome = gradeQuestion(question, answer);

    if (outcome === "skipped") skippedCount++;
    else if (outcome === "correct") {
      score += question.positiveMarks;
      correctCount++;
    } else {
      score -= question.negativeMarks;
      wrongCount++;
    }
  }

  return {
    maxPossibleScore,
    summary: {
      sectionId: section._id,
      title: section.title,
      score,
      correctCount,
      wrongCount,
      skippedCount,
    },
  };
}

function gradeQuestion(question, answer) {
  if (question.type === "numerical") {
    if (
      answer?.numericalAnswer === null ||
      answer?.numericalAnswer === undefined
    )
      return "skipped";
    return numericalAnswersMatch(
      answer.numericalAnswer,
      question.correctNumericalAnswer,
    )
      ? "correct"
      : "wrong";
  }

  const selectedIds = (answer?.selectedOptionIds || []).map((id) =>
    id.toString(),
  );
  if (selectedIds.length === 0) return "skipped";

  const correctIds = question.correctOptionIds.map((id) => id.toString());
  return isExactMatch(selectedIds, correctIds) ? "correct" : "wrong";
}

function isExactMatch(selectedIds, correctIds) {
  if (selectedIds.length !== correctIds.length) return false;
  const correctSet = new Set(correctIds);
  return selectedIds.every((id) => correctSet.has(id));
}
