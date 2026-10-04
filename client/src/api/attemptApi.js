import axiosClient from "./axiosClient.js";

export const startAttempt = (examId) =>
  axiosClient.post(`/attempts/${examId}/start`).then((res) => res.data);

export const startSection = (attemptId, sectionId) =>
  axiosClient
    .post(`/attempts/${attemptId}/section/${sectionId}/start`)
    .then((res) => res.data);

export const saveAnswer = (
  attemptId,
  questionId,
  selectedOptionIds,
  status,
  numericalAnswer = null,
) =>
  axiosClient
    .post(`/attempts/${attemptId}/answer`, {
      questionId,
      selectedOptionIds,
      numericalAnswer,
      status,
    })
    .then((res) => res.data);

export const submitAttempt = (attemptId, autoSubmitted = false) =>
  axiosClient
    .post(`/attempts/${attemptId}/submit`, { autoSubmitted })
    .then((res) => res.data);

export const logIntegrityEvent = (attemptId, type) =>
  axiosClient
    .post(`/attempts/${attemptId}/integrity`, { type })
    .then((res) => res.data)
    .catch(() => null);
