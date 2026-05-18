import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../context/authStore';

/** Backend `/api` root, e.g. `http://51.20.7.80:5000/api` — baked in at `vite build`. */
function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL?.trim() ?? '';
  if (!raw) {
    const msg =
      'VITE_API_URL is not set. Set GitHub secret VITE_API_URL (e.g. http://51.20.7.80:5000/api) and rebuild.';
    if (import.meta.env.PROD) {
      throw new Error(msg);
    }
    console.warn(`[api] ${msg} Requests will hit the frontend host (S3) and 404.`);
    return '';
  }
  return raw.replace(/\/+$/, '');
}

const baseURL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL,
  timeout: 30000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: { message?: string; code?: string } }>) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        useAuthStore.getState().logout();
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(err: unknown, fallback = 'Operation failed'): string {
  const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
  return axiosErr?.response?.data?.error?.message ?? axiosErr?.message ?? fallback;
}
