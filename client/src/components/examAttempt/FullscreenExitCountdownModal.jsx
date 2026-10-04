export default function FullscreenExitCountdownModal({
  secondsRemaining,
  onReturnToFullscreen,
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-surface rounded-xl shadow-lg p-8 text-center max-w-sm">
        <h2 className="text-xl font-bold text-rose-600 mb-2">
          You've left fullscreen
        </h2>
        <p className="text-text-muted mb-4">
          This exam requires fullscreen mode. Your exam will be submitted
          automatically in
        </p>
        <div className="text-5xl font-bold text-rose-600 mb-4">
          {secondsRemaining}
        </div>
        <p className="text-text-muted text-sm mb-6">
          seconds unless you return to fullscreen now.
        </p>
        <button
          onClick={onReturnToFullscreen}
          className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 shadow-md"
        >
          Return to fullscreen now
        </button>
      </div>
    </div>
  );
}
