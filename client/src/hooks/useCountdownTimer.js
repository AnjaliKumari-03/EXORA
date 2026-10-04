import { useEffect, useRef, useState } from "react";

export function useCountdownTimer(startedAt, totalDurationSeconds, onExpire) {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    calculateRemaining(startedAt, totalDurationSeconds),
  );
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateRemaining(startedAt, totalDurationSeconds);
      setRemainingSeconds(remaining);

      if (remaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, totalDurationSeconds, onExpire]);

  return remainingSeconds;
}

function calculateRemaining(startedAt, totalDurationSeconds) {
  const elapsedSeconds = (Date.now() - new Date(startedAt).getTime()) / 1000;
  return Math.max(0, Math.round(totalDurationSeconds - elapsedSeconds));
}
