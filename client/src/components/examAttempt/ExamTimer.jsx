import { useCountdownTimer } from "../../hooks/useCountdownTimer.js";
import { formatTime } from "../../utils/formatTime.js";

export default function ExamTimer({
  startedAt,
  totalDurationSeconds,
  onExpire,
}) {
  const remainingSeconds = useCountdownTimer(
    startedAt,
    totalDurationSeconds,
    onExpire,
  );
  const isLow = remainingSeconds <= 300;

  return (
    <div
      className={`px-4 py-2 rounded-lg font-mono text-lg font-bold border-2 ${
        isLow
          ? "bg-rose-100 text-rose-700 border-rose-300"
          : "bg-surface text-text-main border-purple-100"
      }`}
    >
      {formatTime(remainingSeconds)}
    </div>
  );
}
