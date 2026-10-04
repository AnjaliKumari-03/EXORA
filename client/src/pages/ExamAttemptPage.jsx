import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExamSessionStore } from "../store/examSessionStore.js";
import {
  startAttempt,
  startSection,
  saveAnswer,
  submitAttempt,
} from "../api/attemptApi.js";
import { useIntegrityMonitor } from "../hooks/useIntegrityMonitor.js";
import { useExamLockdown } from "../hooks/useExamLockdown.js";
import ExamTimer from "../components/examAttempt/ExamTimer.jsx";
import SectionTabs from "../components/examAttempt/SectionTabs.jsx";
import QuestionPalette from "../components/examAttempt/QuestionPalette.jsx";
import QuestionCard from "../components/examAttempt/QuestionCard.jsx";
import NavigationControls from "../components/examAttempt/NavigationControls.jsx";
import SubmitConfirmModal from "../components/examAttempt/SubmitConfirmModal.jsx";
import FullscreenGate from "../components/examAttempt/FullscreenGate.jsx";
import IntegrityWarningBanner, {
  VIOLATION_MESSAGES,
} from "../components/examAttempt/IntegrityWarningBanner.jsx";
import IntegrityStrikeModal from "../components/examAttempt/IntegrityStrikeModal.jsx";
import FullscreenExitCountdownModal from "../components/examAttempt/FullscreenExitCountdownModal.jsx";
import Brand from "../components/layout/Brand.jsx";
import Footer from "../components/layout/Footer.jsx";

const MIN_DESKTOP_WIDTH = 1024;
const FULLSCREEN_EXIT_GRACE_SECONDS = 10;
const MAX_INTEGRITY_VIOLATIONS = 3;

export default function ExamAttemptPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [isDesktop, setIsDesktop] = useState(
    window.innerWidth >= MIN_DESKTOP_WIDTH,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [hasPassedFullscreenGate, setHasPassedFullscreenGate] = useState(false);
  const [fullscreenExitCountdown, setFullscreenExitCountdown] = useState(null);
  const [showStrikeModal, setShowStrikeModal] = useState(false);
  const [fullscreenExitDeadline, setFullscreenExitDeadline] = useState(null);
  const hasSubmittedRef = useRef(false);
  const wasEverFullscreenRef = useRef(false);

  const {
    attemptId,
    startedAt,
    exam,
    answers,
    sectionStartedAt,
    currentSectionIndex,
    currentQuestionIndex,
    loadAttempt,
    goToQuestion,
    goToSection,
    setSectionStarted,
    setAnswer,
  } = useExamSessionStore();

  const {
    violationCount,
    lastViolationType,
    isFullscreen,
    requestFullscreen,
    exitFullscreenCleanly,
    recordViolation,
  } = useIntegrityMonitor({
    attemptId,
    active: hasPassedFullscreenGate,
    maxViolations: MAX_INTEGRITY_VIOLATIONS,
  });

  useExamLockdown(hasPassedFullscreenGate, () =>
    recordViolation("restricted-key"),
  );

  useEffect(() => {
    if (violationCount === 0) return;
    setShowStrikeModal(true);

    if (
      violationCount >= MAX_INTEGRITY_VIOLATIONS &&
      !hasSubmittedRef.current
    ) {
      hasSubmittedRef.current = true;
      const timeout = setTimeout(() => {
        exitFullscreenCleanly();
        submitAttempt(attemptId, true).then(({ resultId }) =>
          navigate(`/results/${resultId}`),
        );
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [violationCount, attemptId, exitFullscreenCleanly, navigate]);

  async function handleEnterFullscreen() {
    wasEverFullscreenRef.current = false;
    hasSubmittedRef.current = false;
    setFullscreenExitDeadline(null);
    await requestFullscreen();
    setHasPassedFullscreenGate(true);
  }

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= MIN_DESKTOP_WIDTH);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    startAttempt(examId)
      .then((data) => loadAttempt(data))
      .catch(() => setError("Could not load this exam"))
      .finally(() => setIsLoading(false));
  }, [examId, isDesktop, loadAttempt]);

  const currentSection = exam?.sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  const isSectionLocked = useCallback(
    (section, index) => {
      if (exam?.restrictSectionNavigation) {
        return index !== currentSectionIndex;
      }
      return false;
    },
    [exam, currentSectionIndex],
  );

  useEffect(() => {
    if (!currentSection || !attemptId || sectionStartedAt[currentSection.id])
      return;
    const optimisticTimestamp = new Date().toISOString();
    setSectionStarted(currentSection.id, optimisticTimestamp);
    startSection(attemptId, currentSection.id).then((data) => {
      setSectionStarted(currentSection.id, data.startedAt);
    });
  }, [currentSection, attemptId, sectionStartedAt, setSectionStarted]);

  const persistAnswer = useCallback(
    (questionId, selectedOptionIds, status, numericalAnswer = null) => {
      setAnswer(questionId, selectedOptionIds, status, numericalAnswer);
      saveAnswer(
        attemptId,
        questionId,
        selectedOptionIds,
        status,
        numericalAnswer,
      );
    },
    [attemptId, setAnswer],
  );

  useEffect(() => {
    if (!currentQuestion || answers[currentQuestion.id]) return;
    persistAnswer(currentQuestion.id, [], "not-attempted");
  }, [currentQuestion, answers, persistAnswer]);

  function findNextUnlockedSectionIndex(fromIndex) {
    if (fromIndex + 1 < exam.sections.length) return fromIndex + 1;
    return -1;
  }

  const handleSectionExpire = useCallback(async () => {
    const nextIndex = findNextUnlockedSectionIndex(currentSectionIndex);
    if (nextIndex === -1) {
      if (hasSubmittedRef.current) return;
      hasSubmittedRef.current = true;
      exitFullscreenCleanly();
      const { resultId } = await submitAttempt(attemptId, true);
      navigate(`/results/${resultId}`);
    } else {
      goToSection(nextIndex);
    }
  }, [
    currentSectionIndex,
    exam,
    attemptId,
    goToSection,
    navigate,
    exitFullscreenCleanly,
  ]);

  async function handleExpire() {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    exitFullscreenCleanly();
    const { resultId } = await submitAttempt(attemptId, true);
    navigate(`/results/${resultId}`);
  }

  async function handleConfirmSubmit() {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    setShowSubmitConfirm(false);
    exitFullscreenCleanly();
    const { resultId } = await submitAttempt(attemptId, false);
    navigate(`/results/${resultId}`);
  }

  useEffect(() => {
    if (hasPassedFullscreenGate && isFullscreen) {
      wasEverFullscreenRef.current = true;
    }
  }, [hasPassedFullscreenGate, isFullscreen]);

  useEffect(() => {
    if (!hasPassedFullscreenGate) return;
    if (isFullscreen) {
      setFullscreenExitDeadline(null);
      return;
    }
    if (wasEverFullscreenRef.current) {
      setFullscreenExitDeadline(
        (current) =>
          current ?? Date.now() + FULLSCREEN_EXIT_GRACE_SECONDS * 1000,
      );
    }
  }, [isFullscreen, hasPassedFullscreenGate]);

  useEffect(() => {
    if (fullscreenExitDeadline === null) {
      setFullscreenExitCountdown(null);
      return;
    }

    function tick() {
      const secondsLeft = Math.max(
        0,
        Math.ceil((fullscreenExitDeadline - Date.now()) / 1000),
      );
      setFullscreenExitCountdown(secondsLeft);
      if (secondsLeft <= 0 && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        exitFullscreenCleanly();
        submitAttempt(attemptId, true).then(({ resultId }) =>
          navigate(`/results/${resultId}`),
        );
      }
    }

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [fullscreenExitDeadline, attemptId, navigate, exitFullscreenCleanly]);

  function handleSelectSection(index) {
    if (exam.restrictSectionNavigation) return;
    if (index === currentSectionIndex) return;
    goToSection(index);
  }

  function handleNext() {
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  }

  function handleMoveToNextSection() {
    const nextIndex = currentSectionIndex + 1;
    if (nextIndex < exam.sections.length) {
      goToSection(nextIndex);
    }
  }

  if (!isDesktop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-4">
        <Brand />
        <div className="bg-surface rounded-xl shadow-md p-8 text-center max-w-sm">
          <h1 className="text-xl font-semibold text-text-main mb-2">
            Desktop required
          </h1>
          <p className="text-text-muted">
            For exam security, this exam can only be attempted on a laptop or
            desktop. Please switch devices to continue.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-4">
        <Brand />
        <p className="text-text-muted">Loading exam...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-4">
        <Brand />
        <p className="text-rose-500">{error}</p>
      </div>
    );
  }
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-4">
        <Brand />
        <p className="text-text-muted">This exam has no questions.</p>
      </div>
    );
  }

  if (!hasPassedFullscreenGate) {
    return <FullscreenGate onEnter={handleEnterFullscreen} />;
  }

  const currentAnswer = answers[currentQuestion.id] ?? {
    selectedOptionIds: [],
    numericalAnswer: null,
    status: "not-attempted",
  };
  const sectionStartTimestamp =
    sectionStartedAt[currentSection.id] ?? startedAt;
  const isLastQuestionInSection =
    currentQuestionIndex === currentSection.questions.length - 1;
  const isLastSection = currentSectionIndex === exam.sections.length - 1;

  return (
    <div className="min-h-screen bg-background px-4 py-6 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-4">
          <Brand size="sm" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-bold text-text-main">{exam.title}</h1>
              <div className="flex items-center gap-2">
                {exam.restrictSectionNavigation ? (
                  <ExamTimer
                    key={currentSection.id}
                    startedAt={sectionStartTimestamp}
                    totalDurationSeconds={currentSection.durationSeconds}
                    onExpire={handleSectionExpire}
                  />
                ) : (
                  <ExamTimer
                    startedAt={startedAt}
                    totalDurationSeconds={exam.totalDurationSeconds}
                    onExpire={handleExpire}
                  />
                )}
              </div>
            </div>

            <IntegrityWarningBanner
              violationCount={violationCount}
              lastViolationType={lastViolationType}
              isFullscreen={isFullscreen}
              onReturnToFullscreen={requestFullscreen}
            />

            {exam.sections.length > 1 && (
              <SectionTabs
                sections={exam.sections}
                currentSectionIndex={currentSectionIndex}
                isSectionLocked={isSectionLocked}
                onSelect={handleSelectSection}
              />
            )}

            <QuestionCard
              question={currentQuestion}
              selectedOptionIds={currentAnswer.selectedOptionIds}
              numericalAnswer={currentAnswer.numericalAnswer}
              onAnswerChange={(selectedOptionIds) =>
                persistAnswer(
                  currentQuestion.id,
                  selectedOptionIds,
                  "attempted",
                )
              }
              onNumericalAnswerChange={(numericalAnswer) =>
                persistAnswer(
                  currentQuestion.id,
                  [],
                  "attempted",
                  numericalAnswer,
                )
              }
            />

            <NavigationControls
              navigationMode={exam.navigationMode}
              isFirst={currentQuestionIndex === 0}
              isLast={isLastQuestionInSection}
              showMoveToNextSection={isLastQuestionInSection && !isLastSection}
              onPrevious={() => goToQuestion(currentQuestionIndex - 1)}
              onNext={handleNext}
              onMoveToNextSection={handleMoveToNextSection}
              onMarkForReview={() => {
                persistAnswer(
                  currentQuestion.id,
                  currentAnswer.selectedOptionIds,
                  "marked-for-review",
                );
                handleNext();
              }}
              onClearAnswer={() =>
                persistAnswer(currentQuestion.id, [], "not-attempted")
              }
            />
          </div>

          <div>
            <QuestionPalette
              questions={currentSection.questions}
              answers={answers}
              currentIndex={currentQuestionIndex}
              onSelect={goToQuestion}
              isSelectable={(index) =>
                exam.navigationMode !== "one-way" ||
                index >= currentQuestionIndex
              }
            />
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 shadow-md"
            >
              Submit exam
            </button>
          </div>
        </div>
      </div>
      <Footer />

      {showSubmitConfirm && (
        <SubmitConfirmModal
          questions={exam.sections.flatMap((s) => s.questions)}
          answers={answers}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowSubmitConfirm(false)}
        />
      )}

      {fullscreenExitCountdown !== null ? (
        <FullscreenExitCountdownModal
          secondsRemaining={fullscreenExitCountdown}
          onReturnToFullscreen={requestFullscreen}
        />
      ) : (
        showStrikeModal && (
          <IntegrityStrikeModal
            message={
              VIOLATION_MESSAGES[lastViolationType] ||
              "An integrity event was detected."
            }
            strikeNumber={violationCount}
            maxStrikes={MAX_INTEGRITY_VIOLATIONS}
            onDismiss={() => setShowStrikeModal(false)}
          />
        )
      )}
    </div>
  );
}
