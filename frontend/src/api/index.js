import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  const isAuthRoute =
    req.url.includes("/auth/login") ||
    req.url.includes("/auth/signup");

  if (token && !isAuthRoute) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// -------- Auth --------
export const requestSignupOtp = (data) =>
  API.post("/auth/signup/request-otp", data);
export const verifySignupOtp = (data) =>
  API.post("/auth/signup/verify-otp", data);
export const resendSignupOtp = (data) =>
  API.post("/auth/signup/resend-otp", data);
export const login = (data) => API.post("/auth/login", data);

// -------- Statements --------
/**
 * Upload a statement.  `password` is optional and only sent when the user
 * has supplied one for an encrypted PDF.
 */
export const uploadStatement = (file, password) => {
  const formData = new FormData();
  formData.append("file", file);
  if (password) formData.append("password", password);

  return API.post("/statements/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const fetchStatements = () => API.get("/statements");
export const fetchStatementById = (id) => API.get(`/statements/${id}`);
export const deleteStatement = (id) => API.delete(`/statements/${id}`);

export default API;
