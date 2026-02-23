import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV } from '../../config/env';
import { logoutApi, refreshApi } from './Authservice';


// These are set from AuthContext after login/refresh
// We use a module-level getter/setter so axiosInstance can access React state
let getTokenFn: (() => string | null) | null = null;
let setTokenFn: ((token: string | null) => void) | null = null;

export function bindAuthToAxios(
  getter: () => string | null,
  setter: (token: string | null) => void
) {
  getTokenFn = getter;
  setTokenFn = setter;
}

// ── Refresh queue ─────────────────────────────────────────────────────────────
type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((item) => {
    if (error) item.reject(error);
    else item.resolve(token!);
  });
  failedQueue = [];
}

// ── Axios instance ────────────────────────────────────────────────────────────
const axiosInstance: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // always send httpOnly cookie with every request
});

// ── Request interceptor — attach access token from React state ────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getTokenFn ? getTokenFn() : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 ────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Queue concurrent requests while refresh is in progress
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Hit refresh — browser sends httpOnly cookie automatically (withCredentials: true)
      const newAccessToken = await refreshApi();

      if (!newAccessToken) {
        processQueue(new Error('Refresh failed'), null);
        logoutApi();
        return Promise.reject(error);
      }

      // Save new access token to React state
      if (setTokenFn) setTokenFn(newAccessToken);

      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      logoutApi();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;