import axios from "axios";

console.log("API Base URL:", process.env.NEXT_PUBLIC_API_URL);

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030",
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("seller_token")
      : null;

  const base = config.baseURL ?? "";
  const url = config.url ?? "";

  console.log("Token found:", !!token);
  console.log("Request URL:", base + url);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;

    if (!error.response) {
      window.location.href = "/error";
      return Promise.reject(error);
    }

    if (status === 401) window.location.href = "/auth/login";
    if (status === 403) window.location.href = "/403";
    if (status === 404) window.location.href = "/not-found";
    if (status >= 500) window.location.href = "/error";

    return Promise.reject(error);
  }
);
