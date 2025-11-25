// src/api/client.js
import axios from 'axios';

// Base URL: prefer Vite env, fallback to local dev API
// Keep a trailing slash off baseURL to avoid double slashes when joining paths.
const API_BASE_URL =
  (import.meta?.env?.VITE_API_URL && import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '')) ||
  'http://127.0.0.1:8000/api';

console.log('🔗 API Client initialized with base URL:', API_BASE_URL);

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// ---- Token storage helpers (localStorage-based) ----
function getAccessToken() {
  return localStorage.getItem('access_token');
}
function getRefreshToken() {
  return localStorage.getItem('refresh_token');
}
function setAccessToken(token) {
  if (token) localStorage.setItem('access_token', token);
}
function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// ---- Request interceptor: attach Authorization + content-type handling ----
client.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData: let the browser set Content-Type with correct boundary
    if (config.data instanceof FormData) {
      if (config.headers && config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    } else {
      config.headers = {
        ...(config.headers || {}),
        'Content-Type': 'application/json',
      };
    }

    console.log('📤 Request:', (config.method || 'GET').toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// ---- Refresh coordination to avoid race conditions ----
let isRefreshing = false;
let pendingQueue = [];

function enqueueRequest(resolve, reject, originalRequest) {
  pendingQueue.push({ resolve, reject, originalRequest });
}

function flushQueue(error, newToken = null) {
  pendingQueue.forEach(({ resolve, reject, originalRequest }) => {
    if (newToken) {
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      resolve(client(originalRequest));
    } else {
      reject(error);
    }
  });
  pendingQueue = [];
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token');

  const refreshUrl = `${API_BASE_URL}/token/refresh/`;
  const resp = await axios.post(
    refreshUrl,
    { refresh },
    { timeout: 15000 }
  );
  const newAccess = resp?.data?.access;
  if (!newAccess) {
    throw new Error('Refresh response missing access token');
  }
  setAccessToken(newAccess);
  client.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
  return newAccess;
}

// ---- Response interceptor: one-time refresh on 401, then retry ----
client.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config?.url);
    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config || {};

    // Log network-level failures (no HTTP response)
    if (!error.response) {
      // Typical causes: server down, CORS blocked, DNS, timeout
      console.error('🌐 Network error:', error?.code || 'ERR_NETWORK', error?.message);
      return Promise.reject(error);
    }

    // Only handle 401 once per request and skip for refresh endpoint itself
    const is401 = status === 401;
    const isRefreshCall = originalRequest?.url?.includes('/token/refresh/');
    if (is401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;

      if (!getRefreshToken()) {
        clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue while a refresh is in progress
        return new Promise((resolve, reject) => {
          enqueueRequest(resolve, reject, originalRequest);
        });
      }

      isRefreshing = true;
      try {
        console.log('🔄 Attempting token refresh...');
        const newToken = await refreshAccessToken();
        console.log('✅ Token refreshed');
        flushQueue(null, newToken);

        // Retry original request with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshErr) {
        console.error('❌ Token refresh failed:', refreshErr?.message || refreshErr);
        flushQueue(refreshErr, null);
        clearTokens();
        // Optional: redirect to sign-in
        window.location.href = '/signin';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Non-401 or already retried
    console.error('❌ Response error:', status, error?.message);
    return Promise.reject(error);
  }
);

export default client;
