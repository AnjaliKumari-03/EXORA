import { useEffect, useRef } from "react";

const BLOCKED_KEY_COMBOS = [
  // Devtools
  { key: "F12" },
  { key: "I", ctrlOrMeta: true, shift: true },
  { key: "J", ctrlOrMeta: true, shift: true },
  { key: "C", ctrlOrMeta: true, shift: true },
  { key: "U", ctrlOrMeta: true },
];

export function useExamLockdown(active, onBlockedKey) {
  const onBlockedKeyRef = useRef(onBlockedKey);
  useEffect(() => {
    onBlockedKeyRef.current = onBlockedKey;
  }, [onBlockedKey]);

  useEffect(() => {
    if (!active) return;

    function blockContextMenu(e) {
      e.preventDefault();
    }

    function blockClipboardEvent(e) {
      e.preventDefault();
    }

    function blockKeydown(e) {
      const matches = BLOCKED_KEY_COMBOS.some((combo) => {
        if (combo.key.toLowerCase() !== e.key.toLowerCase()) return false;
        if (combo.ctrlOrMeta && !(e.ctrlKey || e.metaKey)) return false;
        if (combo.shift && !e.shiftKey) return false;
        return true;
      });
      if (matches) {
        e.preventDefault();
        onBlockedKeyRef.current?.();
      }
    }

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("copy", blockClipboardEvent);
    document.addEventListener("cut", blockClipboardEvent);
    document.addEventListener("paste", blockClipboardEvent);
    document.addEventListener("keydown", blockKeydown);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("copy", blockClipboardEvent);
      document.removeEventListener("cut", blockClipboardEvent);
      document.removeEventListener("paste", blockClipboardEvent);
      document.removeEventListener("keydown", blockKeydown);
    };
  }, [active]);
}
