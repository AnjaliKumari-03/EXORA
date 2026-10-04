export default function AnswerReviewCard({ question, index }) {
  const isNumerical = question.type === "numerical";
  const isNumericalCorrect = isNumerical && question.isNumericalCorrect;

  return (
    <div className="bg-surface rounded-xl shadow-md p-6 mb-4">
      <p className="text-text-main font-semibold whitespace-pre-line mb-3">
        {index + 1}. {question.text}
      </p>

      {question.imageData && (
        <img
          src={question.imageData}
          alt="Question diagram"
          className="max-w-full rounded-lg border border-purple-100 mb-3"
        />
      )}

      {isNumerical ? (
        <div className="space-y-2">
          <div
            className={`p-3 rounded-lg border text-sm font-medium ${
              question.numericalAnswer === null
                ? "border-purple-100 text-text-muted"
                : isNumericalCorrect
                  ? "bg-emerald-100 border-emerald-500 text-emerald-700"
                  : "bg-rose-100 border-rose-400 text-rose-700"
            }`}
          >
            Your answer:{" "}
            {question.numericalAnswer === null
              ? "not answered"
              : question.numericalAnswer}
          </div>
          {!isNumericalCorrect && (
            <div className="p-3 rounded-lg border bg-emerald-100 border-emerald-500 text-emerald-700 text-sm font-medium">
              Correct answer: {question.correctNumericalAnswer}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const isCorrect = question.correctOptionIds.includes(opt.id);
            const wasSelected = question.selectedOptionIds.includes(opt.id);
            const isWrongPick = wasSelected && !isCorrect;

            return (
              <div
                key={opt.id}
                className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium ${
                  isCorrect
                    ? "bg-emerald-100 border-emerald-500 text-emerald-700"
                    : isWrongPick
                      ? "bg-rose-100 border-rose-400 text-rose-700"
                      : "border-purple-100 text-text-main"
                }`}
              >
                <span>{opt.text}</span>
                {isCorrect && <span>&#10003; correct answer</span>}
                {isWrongPick && <span>&#10007; your answer</span>}
              </div>
            );
          })}
        </div>
      )}

      {!isNumerical && question.selectedOptionIds.length === 0 && (
        <p className="text-stone-500 text-sm mt-2">
          You didn't answer this question.
        </p>
      )}
    </div>
  );
}
