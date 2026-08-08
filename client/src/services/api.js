import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Production Cloud Render Backend URL
const PRODUCTION_API_URL = 'https://hospital-management-system-sagq.onrender.com/api/v1';

// Determine Base URL:
// 1. If running as a native Android/iOS APK, ALWAYS connect to the cloud Render backend.
// 2. If running on Vercel or any remote web host, connect to the cloud Render backend.
// 3. If running on local web browser development, use relative proxy /api/v1.
const getBaseUrl = () => {
  if (Capacitor.isNativePlatform()) {
    return PRODUCTION_API_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return PRODUCTION_API_URL;
  }
  return '/api/v1';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout for mobile network resilience
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
