import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the JWT (if present) to every outgoing request. Uses .set() when
// available (axios v1's AxiosHeaders) and falls back to a plain assignment,
// so this works correctly regardless of what other headers a call passes.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hunar_token");
  if (token) {
    if (config.headers && typeof (config.headers as any).set === "function") {
      (config.headers as any).set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = config.headers || ({} as any);
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// If the server says a token is missing/invalid/expired, the local session
// is stale — clear it so the next natural login attempt starts fresh.
// Deliberately does NOT force-navigate away: doing that mid-action (e.g.
// while uploading a photo) is jarring and can lose unsaved input. The
// person will simply be prompted to log in again next time a protected
// page or action needs it.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("hunar_token");
      localStorage.removeItem("hunar_user");
      window.dispatchEvent(new Event("hunar:session-expired"));
    }
    return Promise.reject(error);
  }
);

export default api;