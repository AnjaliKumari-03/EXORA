export default function SectionConfigList({
  sections,
  onChange,
  requireDuration,
}) {
  function updateSection(id, field, value) {
    onChange(sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  function addSection() {
    const newId = `section-${Date.now()}`;
    onChange([
      ...sections,
      {
        id: newId,
        title: `Section ${sections.length + 1}`,
        durationMinutes: null,
      },
    ]);
  }

  function removeSection(id) {
    if (sections.length === 1) return;
    onChange(sections.filter((s) => s.id !== id));
  }

  return (
    <div className="bg-surface rounded-xl shadow-md p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-main">Sections</h2>
        <button onClick={addSection} className="text-sm text-primary font-bold">
          + Add section
        </button>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="flex items-center gap-3">
          <input
            type="text"
            value={section.title}
            onChange={(e) => updateSection(section.id, "title", e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {requireDuration && (
            <input
              type="number"
              min="1"
              placeholder="Minutes for this section"
              value={section.durationMinutes ?? ""}
              onChange={(e) =>
                updateSection(
                  section.id,
                  "durationMinutes",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              className="w-40 px-3 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              title="Sectional time limit in minutes"
            />
          )}
          {sections.length > 1 && (
            <button
              onClick={() => removeSection(section.id)}
              className="text-rose-500 text-sm"
            >
              Remove
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
