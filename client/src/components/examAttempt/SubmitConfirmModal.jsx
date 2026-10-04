import { getQuestionStatus } from "../../utils/questionStatusColors.js";

export default function SubmitConfirmModal({
  questions,
  answers,
  onConfirm,
  onCancel,
}) {
  const counts = {
    attempted: 0,
    "marked-for-review": 0,
    "not-attempted": 0,
    "not-visited": 0,
  };
  questions.forEach((q) => {
    counts[getQuestionStatus(answers[q.id])]++;
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="bg-orange-200 rounded-xl shadow-md p-6 max-w-sm w-full">
        <h2 className="text-lg font-semibold text-text-main mb-4">
          Submit this exam?
        </h2>

        <ul className="text-sm text-text-muted space-y-1 mb-6">
          <li>
            Answered:{" "}
            <span className="text-green-600 font-medium">
              {counts.attempted}
            </span>
          </li>
          <li>
            Marked for review:{" "}
            <span className="text-purple-600 font-medium">
              {counts["marked-for-review"]}
            </span>
          </li>
          <li>
            Not answered:{" "}
            <span className="text-red-600 font-medium">
              {counts["not-attempted"]}
            </span>
          </li>
          <li>
            Not visited:{" "}
            <span className="text-gray-600 font-medium">
              {counts["not-visited"]}
            </span>
          </li>
        </ul>

        <p className="text-text-muted text-sm mb-6">
          You won't be able to change any answers after this.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg bg-orange-400 text-text-main"
          >
            Go back
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
