import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import FileUploadDropzone from "../components/examCreation/FileUploadDropzone.jsx";
import { parseExamFile } from "../api/examApi.js";
import Brand from "../components/layout/Brand.jsx";
import Footer from "../components/layout/Footer.jsx";

const LOADING_MESSAGES = [
  "Reading your document...",
  "Larger papers take longer — this is normal.",
  "Extracting questions page by page...",
  "Almost there, hang tight...",
];

export default function CreateExamPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isLoading) return;
    setLoadingMessageIndex(0);
    const interval = setInterval(() => {
      setLoadingMessageIndex((i) =>
        Math.min(i + 1, LOADING_MESSAGES.length - 1),
      );
    }, 6000);
    return () => clearInterval(interval);
  }, [isLoading]);

  async function handleFileSelected(file) {
    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await parseExamFile(file);
      setResult(data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message =
        err.response?.data?.message ||
        "Something went wrong while parsing the file";
      setError(detail ? `${message}: ${detail}` : message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-4">
          <Brand size="sm" />
          <Link to="/dashboard" className="text-primary text-sm font-bold">
            &larr; Back to dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-text-main mt-4 mb-6">
          Create exam
        </h1>

        <FileUploadDropzone onFileSelected={handleFileSelected} />

        {isLoading && (
          <p className="text-text-muted mt-4">
            {LOADING_MESSAGES[loadingMessageIndex]}
          </p>
        )}
        {error && <p className="text-rose-500 mt-4">{error}</p>}

        {result && (
          <div className="bg-surface rounded-xl shadow-md p-6 mt-6">
            <p className="text-text-main font-medium mb-1">
              Found {result.questionCount} draft question(s) in{" "}
              {result.fileName}
            </p>

            {result.usedFallback && (
              <p className="text-amber-500 text-sm mb-4">
                AI extraction wasn't available for this upload — used basic
                pattern matching instead, so results may be less accurate.
                Review carefully below.
              </p>
            )}

            {result.draftQuestions.map((q, i) => (
              <div
                key={i}
                className="mb-5 pb-5 border-b border-purple-100 last:border-0"
              >
                <p className="text-text-main font-medium whitespace-pre-line">
                  {i + 1}. {q.text}
                </p>
                <ul className="mt-2 space-y-1">
                  {q.type === "numerical" ? (
                    <li
                      className={`text-sm ${
                        q.correctNumericalAnswer !== null
                          ? "text-emerald-600 font-medium"
                          : "text-amber-500"
                      }`}
                    >
                      {q.correctNumericalAnswer !== null
                        ? `Detected numeric answer: ${q.correctNumericalAnswer}`
                        : "Numerical question — correct answer not auto-detected, set it manually"}
                    </li>
                  ) : (
                    <>
                      {q.options.map((opt, j) => (
                        <li
                          key={j}
                          className={`text-sm ${
                            q.correctOptionIndexes.includes(j)
                              ? "text-emerald-600 font-medium"
                              : "text-text-muted"
                          }`}
                        >
                          {String.fromCharCode(97 + j)}) {opt.text}
                          {q.correctOptionIndexes.includes(j) &&
                            " ✓ (detected correct answer)"}
                        </li>
                      ))}
                      {q.correctOptionIndexes.length === 0 && (
                        <li className="text-amber-500 text-sm">
                          Correct answer not auto-detected — set it manually
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            ))}

            <button
              onClick={() =>
                navigate("/review-exam", {
                  state: { draftQuestions: result.draftQuestions },
                })
              }
              className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 mt-2 shadow-md"
            >
              Continue to review & configure &rarr;
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
