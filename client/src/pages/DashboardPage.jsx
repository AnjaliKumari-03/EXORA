import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { getMyExams, deleteExam } from "../api/examApi.js";
import ThemeToggle from "../components/layout/ThemeToggle.jsx";
import Brand from "../components/layout/Brand.jsx";
import Footer from "../components/layout/Footer.jsx";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedExamId, setCopiedExamId] = useState(null);
  const [armedDeleteExamId, setArmedDeleteExamId] = useState(null);
  const [deletingExamId, setDeletingExamId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    getMyExams()
      .then((data) => setExams(data.exams))
      .catch(() => setError("Could not load your exams"))
      .finally(() => setIsLoading(false));
  }, [location.state?.savedExamId]);

  const examsByCategory = useMemo(() => {
    const grouped = new Map();
    for (const exam of exams) {
      const key = exam.category || "Uncategorized";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(exam);
    }
    return grouped;
  }, [exams]);

  function copyShareLink(examId) {
    const link = `${window.location.origin}/exam/${examId}/attempt`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopiedExamId(examId);
        setTimeout(
          () =>
            setCopiedExamId((current) => (current === examId ? null : current)),
          2000,
        );
      })
      .catch(() => {
        window.prompt("Copy this link to share the exam:", link);
      });
  }

  function handleDeleteClick(examId) {
    if (armedDeleteExamId !== examId) {
      setArmedDeleteExamId(examId);
      setTimeout(
        () =>
          setArmedDeleteExamId((current) =>
            current === examId ? null : current,
          ),
        4000,
      );
      return;
    }

    setArmedDeleteExamId(null);
    setDeletingExamId(examId);
    setDeleteError("");
    deleteExam(examId)
      .then(() => {
        setExams((current) => current.filter((exam) => exam.id !== examId));
      })
      .catch(() =>
        setDeleteError("Could not delete this exam. Please try again."),
      )
      .finally(() => setDeletingExamId(null));
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1">
        <div className="bg-surface rounded-xl shadow-md p-8 mb-4">
          <div className="flex items-center justify-between mb-4">
            <Brand />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={logout}
                className="text-sm text-primary font-bold"
              >
                Log out
              </button>
            </div>
          </div>

          <p className="text-text-muted mb-6">Welcome, {user?.name}.</p>

          <Link
            to="/create-exam"
            className="inline-block bg-primary text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 shadow-md"
          >
            + Create exam
          </Link>
        </div>

        {isLoading && (
          <div className="bg-surface rounded-xl shadow-md p-8">
            <p className="text-text-muted">Loading...</p>
          </div>
        )}
        {error && (
          <div className="bg-surface rounded-xl shadow-md p-8">
            <p className="text-rose-500">{error}</p>
          </div>
        )}
        {deleteError && (
          <div className="bg-surface rounded-xl shadow-md p-4 mb-4">
            <p className="text-rose-500 text-sm">{deleteError}</p>
          </div>
        )}
        {!isLoading && !error && exams.length === 0 && (
          <div className="bg-surface rounded-xl shadow-md p-8">
            <p className="text-text-muted">
              You haven't created any exams yet.
            </p>
          </div>
        )}

        {!isLoading &&
          Array.from(examsByCategory.entries()).map(
            ([category, categoryExams]) => (
              <div
                key={category}
                className="bg-surface rounded-xl shadow-md p-8 mb-4"
              >
                <h2 className="text-lg font-bold text-text-main mb-4">
                  {category}{" "}
                  <span className="text-text-muted font-normal">
                    ({categoryExams.length})
                  </span>
                </h2>

                <ul className="divide-y divide-purple-100">
                  {categoryExams.map((exam) => (
                    <li key={exam.id} className="py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-text-main font-bold">
                            {exam.title}
                          </p>
                          <p className="text-text-muted text-sm">
                            {exam.questionCount} question(s) &middot;{" "}
                            {Math.round(exam.totalDurationSeconds / 60)} min
                          </p>
                        </div>
                        <span className="text-text-muted text-xs whitespace-nowrap">
                          {new Date(exam.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                        <Link
                          to={`/exam/${exam.id}/attempt`}
                          className="text-primary text-sm font-bold"
                        >
                          Take exam &rarr;
                        </Link>
                        <Link
                          to={`/exam/${exam.id}/edit`}
                          className="text-violet-600 text-sm font-bold"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => copyShareLink(exam.id)}
                          className="text-violet-600 text-sm font-bold"
                        >
                          {copiedExamId === exam.id
                            ? "Link copied!"
                            : "Copy share link"}
                        </button>
                        <Link
                          to={`/exam/${exam.id}/results`}
                          className="text-violet-600 text-sm font-bold"
                        >
                          Results overview
                        </Link>
                        {exam.lastResultId && (
                          <Link
                            to={`/results/${exam.lastResultId}`}
                            className="text-text-muted text-sm font-bold"
                          >
                            View last result
                          </Link>
                        )}
                        <button
                          onClick={() => handleDeleteClick(exam.id)}
                          disabled={deletingExamId === exam.id}
                          className={`text-sm font-bold ml-auto ${
                            armedDeleteExamId === exam.id
                              ? "text-white bg-rose-600 px-2 py-1 rounded-md"
                              : "text-rose-600"
                          } disabled:opacity-50`}
                        >
                          {deletingExamId === exam.id
                            ? "Deleting..."
                            : armedDeleteExamId === exam.id
                              ? "Click again to confirm delete"
                              : "Delete"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
      </div>
      <Footer />
    </div>
  );
}
