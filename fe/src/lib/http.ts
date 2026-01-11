import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  // Example: attach auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error handling
    // You can map error codes or show toasts here
    return Promise.reject(error);
  },
);

export default http;
