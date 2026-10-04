import { useState, useEffect } from "react";

export default function SectionAssignTool({
  sections,
  questionCount,
  onAssign,
}) {
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(questionCount);
  const [sectionId, setSectionId] = useState(sections[0]?.id);

  useEffect(() => {
    if (to > questionCount) setTo(questionCount);
  }, [questionCount, to]);

  if (sections.length <= 1) return null;

  function handleAssign() {
    onAssign(from - 1, to - 1, sectionId);
  }

  return (
    <div className="bg-surface rounded-xl shadow-md p-4 flex flex-wrap items-center gap-2">
      <span className="text-sm text-text-main font-bold">Move questions</span>
      <input
        type="number"
        min="1"
        max={questionCount}
        value={from}
        onChange={(e) => setFrom(Number(e.target.value))}
        className="w-16 px-2 py-1 rounded-lg border border-purple-200 text-sm"
      />
      <span className="text-text-muted text-sm">to</span>
      <input
        type="number"
        min="1"
        max={questionCount}
        value={to}
        onChange={(e) => setTo(Number(e.target.value))}
        className="w-16 px-2 py-1 rounded-lg border border-purple-200 text-sm"
      />
      <span className="text-text-muted text-sm">into</span>
      <select
        value={sectionId}
        onChange={(e) => setSectionId(e.target.value)}
        className="px-2 py-1 rounded-lg border border-purple-200 text-sm"
      >
        {sections.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        className="text-primary text-sm font-bold ml-2"
      >
        Move
      </button>
    </div>
  );
}
