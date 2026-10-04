import {
  STATUS_COLORS,
  getQuestionStatus,
} from "../../utils/questionStatusColors.js";

export default function QuestionPalette({
  questions,
  answers,
  currentIndex,
  onSelect,
  isSelectable = () => true,
}) {
  return (
    <div className="bg-surface rounded-xl shadow-md p-4">
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, i) => {
          const status = getQuestionStatus(answers[q.id]);
          const isCurrent = i === currentIndex;
          const selectable = isSelectable(i);
          return (
            <button
              key={q.id}
              onClick={() => selectable && onSelect(i)}
              disabled={!selectable}
              className={`h-10 w-10 rounded-lg text-sm font-bold ${STATUS_COLORS[status]} ${
                isCurrent ? "ring-2 ring-primary" : ""
              } ${!selectable ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-1 text-xs text-text-main font-medium">
        <Legend colorClass="bg-yellow-100" label="Not visited" />
        <Legend
          colorClass="bg-rose-100 border border-rose-400"
          label="Not answered"
        />
        <Legend
          colorClass="bg-emerald-100 border border-emerald-500"
          label="Answered"
        />
        <Legend
          colorClass="bg-violet-100 border border-violet-500"
          label="Marked for review"
        />
      </div>
    </div>
  );
}

function Legend({ colorClass, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded ${colorClass}`} />
      {label}
    </div>
  );
}
