import axiosClient from "./axiosClient.js";

export const getResult = (resultId) =>
  axiosClient.get(`/results/${resultId}`).then((res) => res.data);
