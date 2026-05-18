// utils/api.js

import axios from 'axios';

const api = axios.create({
  baseURL:
  import.meta.env.REACT_APP_URL ||
  'http://localhost:5000/api',

  withCredentials: true,
});

// ─── Request Interceptor: Attach Access Token ───────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Token Refresh Handling ─────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ─── Response Interceptor ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and request not retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      // Prevent infinite refresh loops
      if (originalRequest.url.includes('/auth/refresh')) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Queue requests while refreshing
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // IMPORTANT:
        // Use plain axios instead of api instance
        const { data } = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {},
          {
            withCredentials: true,
          }
        );

        const newToken = data.accessToken;

        // Save new token
        localStorage.setItem('accessToken', newToken);

        // Update default headers
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        // Process queued requests
        processQueue(null, newToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        localStorage.removeItem('accessToken');

        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;