import { useEffect, useRef, useState, useCallback } from "react";
import { logIntegrityEvent } from "../api/attemptApi.js";

export function useIntegrityMonitor({
  attemptId,
  active,
  maxViolations = Infinity,
}) {
  const [violationCount, setViolationCount] = useState(0);
  const [lastViolationType, setLastViolationType] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(
    Boolean(document.fullscreenElement),
  );

  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const recordEvent = useCallback(
    (type) => {
      if (!activeRef.current || !attemptId) return;
      setViolationCount((c) => {
        if (c >= maxViolations) return c;
        return c + 1;
      });
      setLastViolationType(type);
      logIntegrityEvent(attemptId, type);
    },
    [attemptId, maxViolations],
  );

  const isAwayRef = useRef(false);
  const pendingReturnTimeoutRef = useRef(null);
  const RETURN_STABILITY_MS = 600;

  const clearPendingReturn = useCallback(() => {
    if (pendingReturnTimeoutRef.current) {
      clearTimeout(pendingReturnTimeoutRef.current);
      pendingReturnTimeoutRef.current = null;
    }
  }, []);

  const handleAwaySignal = useCallback(
    (type) => {
      const isAway =
        document.visibilityState === "hidden" || !document.hasFocus();

      if (isAway) {
        clearPendingReturn();
        if (!isAwayRef.current) {
          isAwayRef.current = true;
          recordEvent(type);
        }
        return;
      }

      if (!isAwayRef.current || pendingReturnTimeoutRef.current) return;
      pendingReturnTimeoutRef.current = setTimeout(() => {
        pendingReturnTimeoutRef.current = null;
        if (document.visibilityState !== "hidden" && document.hasFocus()) {
          isAwayRef.current = false;
        }
      }, RETURN_STABILITY_MS);
    },
    [recordEvent, clearPendingReturn],
  );

  useEffect(() => {
    function handleVisibilityChange() {
      handleAwaySignal("tab-switch");
    }
    function handleBlur() {
      handleAwaySignal("window-blur");
    }
    function handleFocus() {
      handleAwaySignal("window-blur");
    }
    function handleFullscreenChange() {
      const fsActive = Boolean(document.fullscreenElement);
      setIsFullscreen(fsActive);
      if (!fsActive) recordEvent("fullscreen-exit");
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      clearPendingReturn();
    };
  }, [handleAwaySignal, recordEvent, clearPendingReturn]);

  const requestFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {}
  }, []);

  const exitFullscreenCleanly = useCallback(() => {
    activeRef.current = false;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  return {
    violationCount,
    lastViolationType,
    isFullscreen,
    requestFullscreen,
    exitFullscreenCleanly,
    recordViolation: recordEvent,
  };
}
