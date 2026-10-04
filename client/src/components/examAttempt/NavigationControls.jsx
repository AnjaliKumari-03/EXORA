export default function NavigationControls({
  navigationMode,
  isFirst,
  isLast,
  showMoveToNextSection,
  onPrevious,
  onNext,
  onMoveToNextSection,
  onMarkForReview,
  onClearAnswer,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
      <div className="flex gap-2">
        <button
          onClick={onPrevious}
          disabled={navigationMode === "one-way" || isFirst}
          className="px-4 py-2 rounded-lg font-medium bg-orange-300 text-text-main disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={isLast}
          className="px-4 py-2 rounded-lg font-medium bg-orange-300 text-text-main disabled:opacity-40"
        >
          Next
        </button>
        {showMoveToNextSection && (
          <button
            onClick={onMoveToNextSection}
            className="px-4 py-2 rounded-lg bg-primary text-white font-bold hover:opacity-90 shadow-md"
          >
            Move to next section &rarr;
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClearAnswer}
          className="px-4 py-2 rounded-lg text-text-muted text-sm"
        >
          Clear answer
        </button>
        <button
          onClick={onMarkForReview}
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium"
        >
          Mark for review & next
        </button>
      </div>
    </div>
  );
}
