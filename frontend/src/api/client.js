import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

console.log('🔗 API Client initialized with base URL:', API_BASE_URL);

// Axios client instance
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// REQUEST INTERCEPTOR
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    // 🚫 Skip Authorization header for public endpoints
    const publicEndpoints = [
      '/token/',
      '/users/register/',
      '/password_reset/',
      '/password_reset/confirm/',
    ];
    const isPublic = publicEndpoints.some((url) => config.url?.includes(url));

    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// ✅ RESPONSE INTERCEPTOR
client.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ Response error:', error.response?.status, error.message);

    const originalRequest = error.config;

    // Handle token expiration → auto-refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token found');

        console.log('Attempting token refresh...');
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });

        localStorage.setItem('access_token', response.data.access);

        client.defaults.headers.Authorization = `Bearer ${response.data.access}`;
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

        console.log('Token refreshed successfully');
        return client(originalRequest);
      } catch (err) {
        console.error('Token refresh failed:', err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/signin';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default client;

// Centralized API Helper Methods
export const api = {
  // Auth & User APIs
  register: (data) => client.post('/users/register/', data),
  login: (email, password) => client.post('/token/', { email, password }),
  me: () => client.get('/users/me/'),

  // 👤 User Update (supports multipart/form-data)
  updateUser: (data, isMultipart = false) =>
    client.put('/users/update_me/', data, {
      headers: {
        'Content-Type': isMultipart ? 'multipart/form-data' : 'application/json',
      },
    }),

  // 🧑‍💼 Freelancer Profile
  getFreelancerProfile: () => client.get('/profiles/freelancer/me/'),
  updateProfile: (data) => client.put('/profiles/freelancer/me/', data),

  // Forgot Password (public)
  forgotPassword: (email) => client.post('/password_reset/', { email }),
};
