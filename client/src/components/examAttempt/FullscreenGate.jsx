import Brand from "../layout/Brand.jsx";

export default function FullscreenGate({ onEnter }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-4">
      <Brand />
      <div className="bg-surface rounded-xl shadow-md p-8 text-center max-w-sm">
        <h1 className="text-xl font-bold text-text-main mb-2">
          This exam runs in fullscreen
        </h1>
        <p className="text-text-muted mb-6">
          For exam integrity, this attempt is taken in fullscreen mode. Exiting
          fullscreen, switching tabs, or losing window focus during the exam is
          recorded and visible to the exam creator afterwards. Copy, paste,
          right-click, and common devtools shortcuts are also disabled for the
          duration — a deterrent, not a guarantee, so please don't rely on them
          working anyway.
        </p>
        <button
          onClick={onEnter}
          className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 shadow-md"
        >
          Enter fullscreen & start
        </button>
      </div>
    </div>
  );
}
