const TYPE_LABELS = { mcq: "MCQ", msq: "MSQ", numerical: "Numerical" };

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export default function InsightsCard({ insights }) {
  const { weakestSection, strongestSection, timeInsights, accuracyByType } =
    insights;
  const typeEntries = Object.entries(accuracyByType);

  const hasAnything =
    weakestSection || timeInsights.length > 0 || typeEntries.length > 1;
  if (!hasAnything) return null;

  return (
    <div className="bg-surface rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-lg font-bold text-text-main mb-3">Insights</h2>

      <ul className="space-y-2 mb-4">
        {weakestSection && (
          <li className="text-sm text-text-main">
            <span className="font-bold text-rose-600">Weakest area:</span>{" "}
            {weakestSection.title} — {Math.round(weakestSection.accuracy * 100)}
            % accuracy. Worth another pass before your next attempt.
          </li>
        )}
        {strongestSection && (
          <li className="text-sm text-text-main">
            <span className="font-bold text-emerald-600">Strongest area:</span>{" "}
            {strongestSection.title} —{" "}
            {Math.round(strongestSection.accuracy * 100)}% accuracy.
          </li>
        )}
        {timeInsights.map((t) => (
          <li key={t.title} className="text-sm text-text-main">
            <span className="font-bold text-amber-600">Pacing:</span> you spent{" "}
            {formatDuration(t.timeSpentSeconds)} on {t.title} — noticeably more
            than its fair share of the exam's time (roughly{" "}
            {formatDuration(t.fairShareSeconds)} expected, given its question
            count). Consider budgeting time more evenly next time.
          </li>
        ))}
      </ul>

      {typeEntries.length > 1 && (
        <div>
          <p className="text-sm text-text-muted font-bold mb-2">
            Accuracy by question type
          </p>
          <div className="flex flex-wrap gap-3">
            {typeEntries.map(([type, stats]) => (
              <div
                key={type}
                className="bg-background rounded-lg px-3 py-2 text-sm"
              >
                <span className="font-bold text-text-main">
                  {TYPE_LABELS[type] || type}
                </span>{" "}
                <span className="text-text-muted">
                  {stats.correct}/{stats.attempted} (
                  {Math.round(stats.accuracy * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
