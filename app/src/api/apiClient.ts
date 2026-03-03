import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV } from '@/config/env';
import { logoutApi, refreshApi } from '@/modules/auth/services/Authservice';

type TokenGetter = () => string | null;
type TokenSetter = (token: string | null) => void;

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let getTokenFn: TokenGetter | null = null;
let setTokenFn: TokenSetter | null = null;
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

export function bindAuthToAxios(getter: TokenGetter, setter: TokenSetter): void {
  getTokenFn = getter;
  setTokenFn = setter;
}

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((item) => {
    if (error) item.reject(error);
    else if (token) item.resolve(token);
    else item.reject(new Error('Token refresh failed'));
  });
  failedQueue = [];
}

const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
  timeout: ENV.IS_PRODUCTION ? 10000 : 30000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getTokenFn ? getTokenFn() : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        })
        .catch((queueError) => Promise.reject(queueError));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshApi();
      if (!newAccessToken) {
        processQueue(new Error('Refresh failed'), null);
        await logoutApi();
        return Promise.reject(error);
      }

      if (setTokenFn) setTokenFn(newAccessToken);

      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      processQueue(null, newAccessToken);

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await logoutApi();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
