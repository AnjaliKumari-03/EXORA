import { useState, useEffect } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  Link,
  Navigate,
} from "react-router-dom";
import ExamConfigForm from "../components/examCreation/ExamConfigForm.jsx";
import SectionConfigList from "../components/examCreation/SectionConfigList.jsx";
import SectionAssignTool from "../components/examCreation/SectionAssignTool.jsx";
import ParsedQuestionEditor from "../components/examCreation/ParsedQuestionEditor.jsx";
import {
  saveExam,
  getExamForEdit,
  updateExam,
  getMyExams,
} from "../api/examApi.js";
import Brand from "../components/layout/Brand.jsx";
import Footer from "../components/layout/Footer.jsx";

const DEFAULT_SECTION = {
  id: "section-1",
  title: "Section 1",
  durationMinutes: null,
};

export default function ReviewParsedExamPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { examId } = useParams();
  const isEditMode = Boolean(examId);
  const draftQuestions = location.state?.draftQuestions;

  const [config, setConfig] = useState({
    title: "",
    category: "",
    totalDurationMinutes: 60,
    navigationMode: "free",
    restrictSectionNavigation: false,
    positiveMarks: 1,
    negativeMarks: 0,
  });
  const [existingCategories, setExistingCategories] = useState([]);
  const [sections, setSections] = useState([DEFAULT_SECTION]);
  const [questions, setQuestions] = useState(
    () =>
      draftQuestions?.map((q) => ({
        ...q,
        sectionId: DEFAULT_SECTION.id,
        imageData: q.imageData ?? null,
        type: q.type ?? (q.correctOptionIndexes.length > 1 ? "msq" : "mcq"),
        correctNumericalAnswer: q.correctNumericalAnswer ?? null,
      })) ?? [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingExam, setIsLoadingExam] = useState(isEditMode);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getMyExams()
      .then((data) => {
        const categories = Array.from(
          new Set(
            data.exams
              .map((e) => e.category)
              .filter((c) => c && c !== "Uncategorized"),
          ),
        );
        setExistingCategories(categories);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    getExamForEdit(examId)
      .then((exam) => {
        setConfig({
          title: exam.title,
          category: exam.category || "",
          totalDurationMinutes: Math.round(exam.totalDurationSeconds / 60),
          navigationMode: exam.navigationMode,
          restrictSectionNavigation: exam.restrictSectionNavigation,
          positiveMarks: exam.sections[0]?.questions[0]?.positiveMarks ?? 1,
          negativeMarks: exam.sections[0]?.questions[0]?.negativeMarks ?? 0,
        });
        setSections(
          exam.sections.map((s) => ({
            id: s.id,
            title: s.title,
            durationMinutes: s.durationSeconds
              ? Math.round(s.durationSeconds / 60)
              : null,
          })),
        );
        setQuestions(
          exam.sections.flatMap((s) =>
            s.questions.map((q) => ({
              ...q,
              sectionId: s.id,
            })),
          ),
        );
      })
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            err.message ||
            "Could not load this exam",
        ),
      )
      .finally(() => setIsLoadingExam(false));
  }, [examId, isEditMode]);

  if (!isEditMode && !draftQuestions) {
    return <Navigate to="/create-exam" replace />;
  }

  function updateQuestion(index, updatedQuestion) {
    setQuestions(questions.map((q, i) => (i === index ? updatedQuestion : q)));
  }

  function addBlankQuestion() {
    setQuestions([
      ...questions,
      {
        text: "",
        type: "mcq",
        options: [{ text: "" }, { text: "" }],
        correctOptionIndexes: [],
        correctNumericalAnswer: null,
        imageData: null,
        sectionId: sections[0].id,
      },
    ]);
  }

  function removeQuestion(index) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function handleSectionsChange(updatedSections) {
    const validIds = new Set(updatedSections.map((s) => s.id));
    setQuestions(
      questions.map((q) =>
        validIds.has(q.sectionId)
          ? q
          : { ...q, sectionId: updatedSections[0].id },
      ),
    );
    setSections(updatedSections);
  }

  function assignQuestionRangeToSection(fromIndex, toIndex, sectionId) {
    const start = Math.max(0, Math.min(fromIndex, toIndex));
    const end = Math.min(questions.length - 1, Math.max(fromIndex, toIndex));
    setQuestions(
      questions.map((q, i) =>
        i >= start && i <= end ? { ...q, sectionId } : q,
      ),
    );
  }

  async function handleSave() {
    setError("");

    if (!config.title.trim()) {
      setError("Give the exam a title before saving.");
      return;
    }
    if (
      questions.some(
        (q) => q.type !== "numerical" && q.correctOptionIndexes.length === 0,
      )
    ) {
      setError(
        "Every MCQ/MSQ question needs at least one correct answer selected.",
      );
      return;
    }
    if (
      questions.some(
        (q) => q.type === "numerical" && q.correctNumericalAnswer === null,
      )
    ) {
      setError("Every numerical question needs a correct answer entered.");
      return;
    }
    if (
      config.restrictSectionNavigation &&
      sections.some((s) => !s.durationMinutes || s.durationMinutes <= 0)
    ) {
      setError(
        "Every section needs its own time limit, since section navigation is restricted.",
      );
      return;
    }

    setIsSaving(true);
    try {
      const payload = buildExamPayload(config, sections, questions);
      if (isEditMode) {
        await updateExam(examId, payload);
        navigate(`/dashboard`, { state: { savedExamId: examId } });
      } else {
        const { examId: newExamId } = await saveExam(payload);
        navigate(`/dashboard`, { state: { savedExamId: newExamId } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the exam");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingExam) {
    return <p className="text-center mt-20 text-text-muted">Loading exam...</p>;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-4">
          <Brand size="sm" />
          <Link
            to={isEditMode ? "/dashboard" : "/create-exam"}
            className="text-primary text-sm font-bold"
          >
            &larr; {isEditMode ? "Back to dashboard" : "Back to upload"}
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-text-main mt-4 mb-6">
          {isEditMode ? "Edit exam" : "Review & configure exam"}
        </h1>

        <div className="space-y-4">
          <ExamConfigForm
            config={config}
            onChange={setConfig}
            existingCategories={existingCategories}
          />
          <SectionConfigList
            sections={sections}
            onChange={handleSectionsChange}
            requireDuration={config.restrictSectionNavigation}
          />
          <SectionAssignTool
            sections={sections}
            questionCount={questions.length}
            onAssign={assignQuestionRangeToSection}
          />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-text-main">
                Questions ({questions.length})
              </h2>
              <button
                onClick={addBlankQuestion}
                className="text-sm text-primary font-bold"
              >
                + Add question
              </button>
            </div>
            {questions.map((q, i) => (
              <ParsedQuestionEditor
                key={q.id ?? i}
                question={q}
                index={i}
                sections={sections}
                onChange={(updated) => updateQuestion(i, updated)}
                onRemove={() => removeQuestion(i)}
              />
            ))}
          </div>

          {error && <p className="text-rose-500 text-sm">{error}</p>}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 shadow-md"
          >
            {isSaving ? "Saving..." : isEditMode ? "Save changes" : "Save exam"}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function buildExamPayload(config, sections, questions) {
  return {
    title: config.title,
    category: config.category?.trim() || "",
    navigationMode: config.navigationMode,
    restrictSectionNavigation: config.restrictSectionNavigation,
    totalDurationSeconds: config.totalDurationMinutes * 60,
    sections: sections.map((section) => ({
      id: section.id,
      title: section.title,
      durationSeconds: config.restrictSectionNavigation
        ? section.durationMinutes * 60
        : null,
      questions: questions
        .filter((q) => q.sectionId === section.id)
        .map((q) => ({
          id: q.id,
          type: q.type,
          text: q.text,
          imageData: q.imageData,
          options: q.type === "numerical" ? [] : q.options,
          correctOptionIndexes:
            q.type === "numerical" ? [] : q.correctOptionIndexes,
          correctNumericalAnswer:
            q.type === "numerical" ? q.correctNumericalAnswer : null,
          positiveMarks: config.positiveMarks,
          negativeMarks: q.type === "numerical" ? 0 : config.negativeMarks,
        })),
    })),
  };
}
