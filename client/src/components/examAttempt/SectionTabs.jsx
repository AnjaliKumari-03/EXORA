export default function SectionTabs({
  sections,
  currentSectionIndex,
  isSectionLocked,
  onSelect,
}) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto">
      {sections.map((section, i) => {
        const locked = isSectionLocked(section, i);
        const isCurrent = i === currentSectionIndex;

        return (
          <button
            key={section.id}
            onClick={() => onSelect(i)}
            disabled={locked}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${
              isCurrent
                ? "bg-primary text-white"
                : locked
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-surface text-text-main border border-purple-200"
            }`}
          >
            {section.title}
            {locked && " (locked)"}
          </button>
        );
      })}
    </div>
  );
}
