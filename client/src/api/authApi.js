import axiosClient from "./axiosClient.js";

export const signup = (name, email, password) =>
  axiosClient.post("/auth/signup", { name, email, password }).then((res) => res.data);

export const login = (email, password) =>
  axiosClient.post("/auth/login", { email, password }).then((res) => res.data);

export const getMe = () => axiosClient.get("/auth/me").then((res) => res.data);
