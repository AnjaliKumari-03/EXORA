export const VIOLATION_MESSAGES = {
  "fullscreen-exit": "You exited fullscreen.",
  "tab-switch": "You switched away from this tab.",
  "window-blur": "This window lost focus.",
  "restricted-key": "You tried to use a restricted keyboard shortcut.",
};

export default function IntegrityWarningBanner({
  violationCount,
  lastViolationType,
  isFullscreen,
  onReturnToFullscreen,
}) {
  if (violationCount === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-4 py-3 mb-4 flex items-center justify-between gap-3">
      <p className="text-sm font-medium">
        {VIOLATION_MESSAGES[lastViolationType] ||
          "An integrity event was detected."}{" "}
        This has been recorded ({violationCount} total this attempt) and is
        visible to the exam creator.
      </p>
      {!isFullscreen && (
        <button
          onClick={onReturnToFullscreen}
          className="shrink-0 text-sm font-bold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:opacity-90"
        >
          Return to fullscreen
        </button>
      )}
    </div>
  );
}
