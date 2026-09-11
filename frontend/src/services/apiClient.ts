import axios from 'axios';

// Determine backend URL based on environment
function getApiBackendUrl(): string {
  // 1. Check environment variable first
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  // 2. Client-side detection
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:3001";
    }
    return "https://finfolio-backend.onrender.com";
  }

  // 3. Server-side default
  return "https://finfolio-backend.onrender.com";
}

// Determine ML URL based on environment
function getMLUrl(): string {
  // 1. Check environment variable first
  const envUrl = process.env.NEXT_PUBLIC_ML_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  // 2. Client-side detection
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }
    return "https://finfolio-ml.onrender.com";
  }

  // 3. Server-side default
  return "https://finfolio-ml.onrender.com";
}

const API_BASE_URL = getApiBackendUrl();
const ML_BASE_URL = getMLUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Some Render endpoints can take longer on cold start; give them more breathing room
  timeout: 30000,
});

export const mlClient = axios.create({
  baseURL: ML_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach Authorization Bearer token if present
apiClient.interceptors.request.use((reqConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
  }
  return reqConfig;
});