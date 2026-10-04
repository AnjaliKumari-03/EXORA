import { Routes, Route, Navigate, useParams } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CreateExamPage from "./pages/CreateExamPage.jsx";
import ReviewParsedExamPage from "./pages/ReviewParsedExamPage.jsx";
import ExamAttemptPage from "./pages/ExamAttemptPage.jsx";
import ResultPage from "./pages/ResultPage.jsx";
import ExamResultsOverviewPage from "./pages/ExamResultsOverviewPage.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";

function ExamAttemptRoute() {
  const { examId } = useParams();
  return <ExamAttemptPage key={examId} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-exam"
        element={
          <ProtectedRoute>
            <CreateExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review-exam"
        element={
          <ProtectedRoute>
            <ReviewParsedExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam/:examId/edit"
        element={
          <ProtectedRoute>
            <ReviewParsedExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam/:examId/attempt"
        element={
          <ProtectedRoute>
            <ExamAttemptRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results/:resultId"
        element={
          <ProtectedRoute>
            <ResultPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam/:examId/results"
        element={
          <ProtectedRoute>
            <ExamResultsOverviewPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
