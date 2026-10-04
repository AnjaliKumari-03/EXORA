export default function Brand({ size = "md" }) {
  const isSmall = size === "sm";
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="EXORA"
        className={isSmall ? "w-20 h-20 shrink-0" : "w-20 h-20 shrink-0"}
      />
      <div>
        <div
          className={`font-bold text-text-main leading-tight ${isSmall ? "text-base" : "text-2xl"}`}
        >
          EXORA
        </div>
        {!isSmall && (
          <p className="text-text-muted text-xs leading-tight">
            Smarter. Safer. Assessments.
          </p>
        )}
      </div>
    </div>
  );
}
