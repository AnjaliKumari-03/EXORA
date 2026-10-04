export default function IntegrityStrikeModal({
  message,
  strikeNumber,
  maxStrikes,
  onDismiss,
}) {
  const remaining = maxStrikes - strikeNumber;
  const isFinalStrike = remaining <= 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-surface rounded-xl shadow-lg p-8 text-center max-w-sm">
        <h2 className="text-xl font-bold text-rose-600 mb-2">
          {isFinalStrike
            ? `Strike ${strikeNumber} of ${maxStrikes} — submitting now`
            : `Warning ${strikeNumber} of ${maxStrikes}`}
        </h2>
        <p className="text-text-muted mb-4">{message}</p>
        <p className="text-text-main font-medium mb-6">
          {isFinalStrike
            ? "Your exam is being submitted automatically."
            : remaining === 1
              ? "If this happens 1 more time, your exam will be automatically submitted."
              : `If this happens ${remaining} more times, your exam will be automatically submitted.`}
        </p>
        {/* No dismiss option on the final strike — there's nothing left to
            acknowledge, the submit is already in flight. */}
        {!isFinalStrike && (
          <button
            onClick={onDismiss}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 shadow-md"
          >
            I understand
          </button>
        )}
      </div>
    </div>
  );
}
