import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitkart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Don't redirect if already on auth page or if it's a login/register request
      if (currentPath !== '/auth' && !error.config?.url?.includes('/auth/')) {
        localStorage.removeItem('fitkart_token');
        localStorage.removeItem('fitkart_user');
        // Don't force redirect, let the AuthProvider handle it
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const getImageUrl = (path: string | undefined | null): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}${path}`;
};
