import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_URL 
  ;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// ─── Request Interceptor ─────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Refresh control ─────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

// ─── Response Interceptor ─────────────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Avoid refresh loop
      if (originalRequest.url.includes("/auth/refresh")) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        // ✅ FIX: use BASE URL, NOT hardcoded localhost
        const { data } = await axios.post(
          `${API_BASE}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;

        localStorage.setItem("accessToken", newToken);

        api.defaults.headers.common.Authorization =
          `Bearer ${newToken}`;

        processQueue(null, newToken);

        originalRequest.headers.Authorization =
          `Bearer ${newToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);

        localStorage.removeItem("accessToken");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;