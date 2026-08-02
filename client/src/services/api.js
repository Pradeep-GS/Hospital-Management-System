import axios from 'axios';

// In production (Vercel), VITE_API_URL points to the Render backend.
// In development, it is empty so the Vite proxy forwards /api/v1 → localhost:8080.
const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach stored JWT token dynamically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
