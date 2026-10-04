import { create } from "zustand";

export const useExamSessionStore = create((set) => ({
  attemptId: null,
  startedAt: null,
  exam: null,
  answers: {},
  sectionStartedAt: {},
  currentSectionIndex: 0,
  currentQuestionIndex: 0,

  loadAttempt: ({ attemptId, startedAt, exam, answers, sectionStartedAt }) => {
    set({
      attemptId,
      startedAt,
      exam,
      answers,
      sectionStartedAt: sectionStartedAt || {},
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
    });
  },

  goToQuestion: (index) => set({ currentQuestionIndex: index }),

  goToSection: (sectionIndex) =>
    set({ currentSectionIndex: sectionIndex, currentQuestionIndex: 0 }),

  setSectionStarted: (sectionId, timestamp) =>
    set((state) => ({
      sectionStartedAt: { ...state.sectionStartedAt, [sectionId]: timestamp },
    })),

  setAnswer: (questionId, selectedOptionIds, status, numericalAnswer = null) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: { selectedOptionIds, numericalAnswer, status },
      },
    })),
}));
