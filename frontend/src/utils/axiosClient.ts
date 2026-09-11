import axios, { type InternalAxiosRequestConfig } from "axios";

// Determine backend URL based on environment
function getBackendUrl(): string {
  // 1. Check environment variable first (highest priority)
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  // 2. Client-side detection
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:3001";
    }
    // Production: use the domain's protocol and add backend subdomain
    return "https://finfolio-backend.onrender.com";
  }

  // 3. Server-side default (SSR)
  if (process.env.NODE_ENV !== 'production') {
    return "http://localhost:3001";
  }
  return "https://finfolio-backend.onrender.com";
}

const BACKEND_BASE_URL = getBackendUrl();

const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  withCredentials: true,
  timeout: 15000, // 15 second timeout for better error handling
});

// Attach token automatically
// Helper to check token expiry by decoding the JWT payload (no external lib)
function isTokenExpired(token: string | null) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length < 2 || !parts[1]) return true;
    const payload = JSON.parse(decodeURIComponent(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    ));
    if (!payload || typeof payload !== 'object') return true;
    if (!payload.exp) return true;
    const now = Date.now() / 1000;
    return payload.exp <= now;
  } catch (e) {
    return true;
  }
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    // Attach token if available (even if expired - let backend validate)
    if (token) {
      // Attach valid token (normalize if it accidentally contains a 'Bearer ' prefix)
      const rawToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      config.headers = config.headers || ({} as any);
      (config.headers as Record<string, string>).Authorization = `Bearer ${rawToken}`;
    }
  }
  return config;
});

// Request interceptor to log outgoing requests
api.interceptors.request.use((config) => {
  console.log('🚀 Axios Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: (config.baseURL || '') + (config.url || ''),
    headers: config.headers,
    data: config.data,
  });
  return config;
}, (error) => {
  console.error('❌ Axios Request Error:', error);
  return Promise.reject(error);
});

// Response interceptor to handle 401s and redirect to login
api.interceptors.response.use(
  (response) => {
    console.log('✅ Axios Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ Axios Response Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url,
      data: error.config?.data,
      headers: error.config?.headers,
    });

    try {
      if (error?.response?.status === 401) {
        // Clear invalid token
        try { localStorage.removeItem('token'); } catch (e) {}
        // Redirect to login if not already there
        if (typeof window !== "undefined") {
          const pathname = window.location.pathname;
          if (!pathname.startsWith('/auth')) {
            window.location.href = '/auth/login';
          }
        }
      }
    } catch (e) {
      // ignore logging errors
    }
    return Promise.reject(error);
  }
);

export default api;
