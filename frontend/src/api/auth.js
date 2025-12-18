import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);

export default API;