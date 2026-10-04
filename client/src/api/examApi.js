import axiosClient from "./axiosClient.js";

export const parseExamFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient
    .post("/exams/parse", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

export const saveExam = (examPayload) =>
  axiosClient.post("/exams", examPayload).then((res) => res.data);

export const getMyExams = () =>
  axiosClient.get("/exams").then((res) => res.data);

export const getExamForEdit = (examId) =>
  axiosClient.get(`/exams/${examId}/edit`).then((res) => res.data);

export const updateExam = (examId, examPayload) =>
  axiosClient.put(`/exams/${examId}`, examPayload).then((res) => res.data);

export const getExamResults = (examId) =>
  axiosClient.get(`/exams/${examId}/results`).then((res) => res.data);

export const deleteExam = (examId) =>
  axiosClient.delete(`/exams/${examId}`).then((res) => res.data);
