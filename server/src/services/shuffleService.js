export function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildShuffledQuestionOrder(exam) {
  return exam.sections.map((section) => ({
    sectionId: section._id,
    questionIds: shuffleArray(section.questions.map((q) => q._id)),
  }));
}

export function buildShuffledOptionOrders(exam) {
  const optionOrders = new Map();
  exam.sections.forEach((section) => {
    section.questions.forEach((q) => {
      optionOrders.set(
        q._id.toString(),
        shuffleArray(q.options.map((opt) => opt._id)),
      );
    });
  });
  return optionOrders;
}
