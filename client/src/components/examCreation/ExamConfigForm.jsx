export default function ExamConfigForm({
  config,
  onChange,
  existingCategories = [],
}) {
  function update(field, value) {
    onChange({ ...config, [field]: value });
  }

  return (
    <div className="bg-surface rounded-xl shadow-md p-6 space-y-4">
      <h2 className="text-lg font-bold text-text-main">Exam settings</h2>

      <div>
        <label className="text-sm text-text-muted font-bold block mb-1">
          Exam title
        </label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g. Mock Test 1"
        />
      </div>

      <div>
        <label className="text-sm text-text-muted font-bold block mb-1">
          Category
        </label>
        <input
          type="text"
          list="exam-category-options"
          value={config.category}
          onChange={(e) => update("category", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g. GATE, SSC, Banking..."
        />
        {/* Suggests categories already in use so exams for the same exam
            group land together on the dashboard without retyping — but it's
            still free text, so a brand new category is just as easy. */}
        <datalist id="exam-category-options">
          {existingCategories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-text-muted font-bold block mb-1">
            Total duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            value={config.totalDurationMinutes}
            onChange={(e) =>
              update("totalDurationMinutes", Number(e.target.value))
            }
            className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-sm text-text-muted font-bold block mb-1">
            Navigation
          </label>
          <select
            value={config.navigationMode}
            onChange={(e) => update("navigationMode", e.target.value)}
            className="w-full px-3 py-2  rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="free">Free (move back and forth)</option>
            <option value="one-way">One-way (forward only)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm text-text-muted font-bold block mb-1">
          Can students move freely between sections?
        </label>
        <select
          value={config.restrictSectionNavigation ? "restricted" : "free"}
          onChange={(e) =>
            update("restrictSectionNavigation", e.target.value === "restricted")
          }
          className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="free">
            Yes — one shared timer, jump between sections anytime
          </option>
          <option value="restricted">
            No — each section gets its own fixed time, one-way only
          </option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-text-muted font-bold block mb-1">
            Positive marks per question
          </label>
          <input
            type="number"
            step="0.25"
            value={config.positiveMarks}
            onChange={(e) => update("positiveMarks", Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-sm text-text-muted font-bold block mb-1">
            Negative marks per wrong answer
          </label>
          <input
            type="number"
            step="0.25"
            value={config.negativeMarks}
            onChange={(e) => update("negativeMarks", Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
}
