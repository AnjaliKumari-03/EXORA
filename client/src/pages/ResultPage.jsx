import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getResult } from "../api/resultApi.js";
import ScoreSummaryCard from "../components/result/ScoreSummaryCard.jsx";
import AnswerReviewCard from "../components/result/AnswerReviewCard.jsx";
import InsightsCard from "../components/result/InsightsCard.jsx";
import { downloadResultAnalysis } from "../utils/downloadResultAnalysis.js";
import Brand from "../components/layout/Brand.jsx";
import Footer from "../components/layout/Footer.jsx";

export default function ResultPage() {
  const { resultId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    getResult(resultId)
      .then(setData)
      .catch(() => setError("Could not load this result"));
  }, [resultId]);

  if (error) return <p className="text-center mt-20 text-rose-500">{error}</p>;
  if (!data)
    return (
      <p className="text-center mt-20 text-text-muted">Loading result...</p>
    );

  return (
    <div className="min-h-screen bg-background px-4 py-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-4">
          <Brand size="sm" />
          <Link to="/dashboard" className="text-primary text-sm font-bold">
            &larr; Back to dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mt-4 mb-6 gap-3">
          <h1 className="text-2xl font-bold text-text-main">
            {data.examTitle} — Result
          </h1>
          <button
            onClick={() => downloadResultAnalysis(data.examTitle, data)}
            className="shrink-0 text-sm font-bold bg-primary text-white px-3 py-2 rounded-lg hover:opacity-90"
          >
            Download analysis
          </button>
        </div>

        <ScoreSummaryCard result={data.result} />
        {data.insights && <InsightsCard insights={data.insights} />}

        <h2 className="text-lg font-bold text-text-main mb-3">Answer review</h2>
        {data.sections.map((section) => (
          <div key={section.title} className="mb-6">
            {data.sections.length > 1 && (
              <h3 className="text-sm text-text-muted font-bold mb-2">
                {section.title}
              </h3>
            )}
            {section.questions.map((q, i) => (
              <AnswerReviewCard key={q.id} question={q} index={i} />
            ))}
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
