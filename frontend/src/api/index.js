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

export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const uploadStatement = (formData) =>
  API.post("/statements/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchStatements = () => API.get("/statements");
export const fetchStatementById = (id) =>
  API.get(`/statements/${id}`);

export default API;