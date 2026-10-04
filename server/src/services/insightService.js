import { numericalAnswersMatch } from "./answerMatching.js";

export function buildInsights(exam, attempt, result) {
  const weakStrong = buildWeakStrongSections(exam, result);
  const timeInsights =
    exam.sections.length > 1 ? buildTimeInsights(exam, attempt) : [];
  const accuracyByType = buildAccuracyByType(exam, attempt);

  return { ...weakStrong, timeInsights, accuracyByType };
}

function buildWeakStrongSections(exam, result) {
  if (exam.sections.length <= 1)
    return { weakestSection: null, strongestSection: null };

  const sectionAccuracies = result.sectionScores
    .map((s) => {
      const attempted = s.correctCount + s.wrongCount;
      return {
        title: s.title,
        accuracy: attempted > 0 ? s.correctCount / attempted : null,
        attempted,
      };
    })
    .filter((s) => s.accuracy !== null);

  if (sectionAccuracies.length <= 1)
    return { weakestSection: null, strongestSection: null };

  let weakestSection = sectionAccuracies.reduce((min, s) =>
    s.accuracy < min.accuracy ? s : min,
  );
  let strongestSection = sectionAccuracies.reduce((max, s) =>
    s.accuracy > max.accuracy ? s : max,
  );

  if (weakestSection.title === strongestSection.title) {
    return { weakestSection: null, strongestSection: null };
  }

  return { weakestSection, strongestSection };
}

function buildTimeInsights(exam, attempt) {
  const startEntries = exam.sections
    .map((s) => ({
      title: s.title,
      questionCount: s.questions.length,
      startedAt: attempt.sectionStartedAt.get(s._id.toString()),
    }))
    .filter((s) => s.startedAt)
    .sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));

  if (startEntries.length < 2) return [];

  const totalQuestions = exam.sections.reduce(
    (sum, s) => sum + s.questions.length,
    0,
  );
  if (totalQuestions === 0) return [];

  const endTimestamp = attempt.submittedAt
    ? new Date(attempt.submittedAt)
    : new Date();
  const totalElapsedSeconds =
    (endTimestamp - new Date(startEntries[0].startedAt)) / 1000;
  if (totalElapsedSeconds <= 0) return [];

  const overruns = [];
  for (let i = 0; i < startEntries.length; i++) {
    const current = startEntries[i];
    const next = startEntries[i + 1];
    const sectionEndTime = next ? new Date(next.startedAt) : endTimestamp;
    const timeSpentSeconds = Math.max(
      0,
      (sectionEndTime - new Date(current.startedAt)) / 1000,
    );
    const fairShareSeconds =
      totalElapsedSeconds * (current.questionCount / totalQuestions);

    if (fairShareSeconds > 0 && timeSpentSeconds > fairShareSeconds * 1.5) {
      overruns.push({
        title: current.title,
        timeSpentSeconds: Math.round(timeSpentSeconds),
        fairShareSeconds: Math.round(fairShareSeconds),
      });
    }
  }
  return overruns;
}

function buildAccuracyByType(exam, attempt) {
  const byType = {
    mcq: { correct: 0, attempted: 0 },
    msq: { correct: 0, attempted: 0 },
    numerical: { correct: 0, attempted: 0 },
  };

  for (const section of exam.sections) {
    for (const question of section.questions) {
      const answer = attempt.answers.get(question._id.toString());
      const bucket = byType[question.type];
      if (!bucket) continue;

      if (question.type === "numerical") {
        if (
          answer?.numericalAnswer === null ||
          answer?.numericalAnswer === undefined
        )
          continue;
        bucket.attempted++;
        if (
          numericalAnswersMatch(
            answer.numericalAnswer,
            question.correctNumericalAnswer,
          )
        )
          bucket.correct++;
      } else {
        const selectedIds = (answer?.selectedOptionIds || []).map((id) =>
          id.toString(),
        );
        if (selectedIds.length === 0) continue;
        bucket.attempted++;
        const correctIds = question.correctOptionIds.map((id) => id.toString());
        const isMatch =
          selectedIds.length === correctIds.length &&
          selectedIds.every((id) => correctIds.includes(id));
        if (isMatch) bucket.correct++;
      }
    }
  }

  return Object.fromEntries(
    Object.entries(byType)
      .filter(([, v]) => v.attempted > 0)
      .map(([type, v]) => [
        type,
        {
          correct: v.correct,
          attempted: v.attempted,
          accuracy: v.correct / v.attempted,
        },
      ]),
  );
}
