import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getExamResults } from "../api/examApi.js";
import Brand from "../components/layout/Brand.jsx";
import Footer from "../components/layout/Footer.jsx";

export default function ExamResultsOverviewPage() {
  const { examId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    getExamResults(examId)
      .then(setData)
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            err.message ||
            "Could not load results for this exam",
        ),
      );
  }, [examId]);

  if (error) return <p className="text-center mt-20 text-rose-500">{error}</p>;
  if (!data)
    return (
      <p className="text-center mt-20 text-text-muted">Loading results...</p>
    );

  return (
    <div className="min-h-screen bg-background px-4 py-8 flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-4">
          <Brand size="sm" />
          <Link to="/dashboard" className="text-primary text-sm font-bold">
            &larr; Back to dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-text-main mt-4 mb-1">
          {data.examTitle}
        </h1>
        <p className="text-text-muted mb-6">
          {data.results.length} attempt{data.results.length === 1 ? "" : "s"} so
          far
        </p>

        {data.results.length === 0 ? (
          <div className="bg-surface rounded-xl shadow-md p-8 text-center">
            <p className="text-text-muted">
              No one has attempted this exam yet. Share the exam link from your
              dashboard to get started.
            </p>
          </div>
        ) : (
          <div className="bg-surface rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-100 text-left text-text-muted">
                  <th className="px-4 py-3 font-bold">Student</th>
                  <th className="px-4 py-3 font-bold">Score</th>
                  <th className="px-4 py-3 font-bold">Submitted</th>
                  <th className="px-4 py-3 font-bold">Integrity</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((r) => (
                  <tr
                    key={r.resultId}
                    className="border-b border-purple-50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="text-text-main font-medium">
                        {r.studentName}
                      </p>
                      {r.studentEmail && (
                        <p className="text-text-muted text-xs">
                          {r.studentEmail}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-main">
                      {r.totalScore} / {r.maxPossibleScore}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {r.submittedAt
                        ? new Date(r.submittedAt).toLocaleString()
                        : "—"}
                      {r.autoSubmitted && (
                        <span className="block text-xs text-amber-600">
                          Auto-submitted (time up)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.integrityViolationCount > 0 ? (
                        <span className="text-rose-600 font-bold">
                          {r.integrityViolationCount} flagged
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium">
                          Clean
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/results/${r.resultId}`}
                        className="text-primary font-bold"
                      >
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
