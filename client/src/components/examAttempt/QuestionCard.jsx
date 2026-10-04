export default function QuestionCard({
  question,
  selectedOptionIds,
  numericalAnswer,
  onAnswerChange,
  onNumericalAnswerChange,
}) {
  const isMultiSelect = question.type === "msq";
  const isNumerical = question.type === "numerical";

  function toggleOption(optionId) {
    if (isMultiSelect) {
      const next = selectedOptionIds.includes(optionId)
        ? selectedOptionIds.filter((id) => id !== optionId)
        : [...selectedOptionIds, optionId];
      onAnswerChange(next);
    } else {
      onAnswerChange([optionId]);
    }
  }

  return (
    <div className="bg-surface rounded-xl shadow-md p-6">
      <p className="text-text-main font-semibold whitespace-pre-line mb-4">
        {question.text}
      </p>

      {question.imageData && (
        <img
          src={question.imageData}
          alt="Question diagram"
          className="max-w-full rounded-lg border border-purple-100 mb-4"
        />
      )}

      {isNumerical ? (
        <input
          type="text"
          value={numericalAnswer ?? ""}
          onChange={(e) =>
            onNumericalAnswerChange(
              e.target.value === "" ? null : e.target.value,
            )
          }
          placeholder="Type your answer"
          className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ) : (
        <div className="space-y-2">
          {question.options.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-purple-100 cursor-pointer hover:bg-background"
            >
              <input
                type={isMultiSelect ? "checkbox" : "radio"}
                checked={selectedOptionIds.includes(opt.id)}
                onChange={() => toggleOption(opt.id)}
              />
              <span className="text-text-main font-medium">{opt.text}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
