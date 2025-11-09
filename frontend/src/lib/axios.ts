import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000/api"
      : "/api",
});

api.interceptors.request.use((config) => {
  const {token} = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
