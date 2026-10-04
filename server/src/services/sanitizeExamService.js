export function sanitizeExamForAttempt(
  exam,
  questionOrder = [],
  optionOrders = new Map(),
) {
  return {
    id: exam._id,
    title: exam.title,
    navigationMode: exam.navigationMode,
    restrictSectionNavigation: exam.restrictSectionNavigation,
    totalDurationSeconds: exam.totalDurationSeconds,
    sections: exam.sections.map((section) => {
      const orderedQuestions = getOrderedQuestions(section, questionOrder);
      return {
        id: section._id,
        title: section.title,
        durationSeconds: section.durationSeconds,
        questions: orderedQuestions.map((q) => ({
          id: q._id,
          type: q.type,
          text: q.text,
          imageData: q.imageData,
          options: getOrderedOptions(q, optionOrders).map((opt) => ({
            id: opt._id,
            text: opt.text,
          })),
          positiveMarks: q.positiveMarks,
          negativeMarks: q.negativeMarks,
        })),
      };
    }),
  };
}

function getOrderedQuestions(section, questionOrder) {
  const orderEntry = questionOrder.find(
    (entry) => entry.sectionId.toString() === section._id.toString(),
  );
  if (!orderEntry) return section.questions;
  return orderEntry.questionIds
    .map((id) => section.questions.id(id))
    .filter(Boolean);
}

function getOrderedOptions(question, optionOrders) {
  const order = optionOrders.get(question._id.toString());
  if (!order) return question.options;
  return order.map((id) => question.options.id(id)).filter(Boolean);
}
