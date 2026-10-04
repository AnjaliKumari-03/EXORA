export default function ScoreSummaryCard({ result }) {
  return (
    <div className="bg-surface rounded-xl shadow-md p-6 mb-4">
      <div className="text-center mb-6">
        <p className="text-text-muted text-sm font-semibold">Your score</p>
        <p className="text-4xl font-bold text-primary">
          {result.totalScore}{" "}
          <span className="text-text-muted text-xl font-medium">
            / {result.maxPossibleScore}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center mb-6">
        <Stat
          label="Correct"
          value={result.correctCount}
          colorClass="text-emerald-600"
        />
        <Stat
          label="Wrong"
          value={result.wrongCount}
          colorClass="text-rose-600"
        />
        <Stat
          label="Skipped"
          value={result.skippedCount}
          colorClass="text-stone-500"
        />
      </div>

      {result.sectionScores.length > 1 && (
        <div>
          <p className="text-sm text-text-muted font-bold mb-2">
            Section-wise breakdown
          </p>
          <ul className="divide-y divide-purple-100">
            {result.sectionScores.map((section) => (
              <li
                key={section.sectionId}
                className="py-2 flex items-center justify-between"
              >
                <span className="text-text-main font-medium">
                  {section.title}
                </span>
                <span className="text-text-muted text-sm">
                  {section.score} pts &middot; {section.correctCount} correct
                  &middot; {section.wrongCount} wrong &middot;{" "}
                  {section.skippedCount} skipped
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, colorClass }) {
  return (
    <div>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-text-muted text-xs font-semibold">{label}</p>
    </div>
  );
}
