export default function Footer() {
  return (
    <footer className="max-w-2xl mx-auto px-4 py-6 mt-auto">
      <div className="flex flex-col items-center gap-2 text-center">
        <img src="/logo.png" alt="EXORA" className="w-10 h-10 opacity-70" />
        <p className="text-text-muted text-xs">
          EXORA — Smarter. Safer. Assessments.
        </p>
        <p className="text-text-muted text-xs opacity-70">
          &copy; {new Date().getFullYear()} EXORA. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
