import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV } from '@/config/env';
import { refreshApi } from '@/modules/auth/services/Authservice';
import { createAuthRefreshQueue } from '@/api/authQueue';

type TokenGetter = () => string | null;
type TokenSetter = (token: string | null) => void;

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let getTokenFn: TokenGetter | null = null;
let setTokenFn: TokenSetter | null = null;
let isRefreshing = false;
const refreshQueue = createAuthRefreshQueue();

export function bindAuthToAxios(getter: TokenGetter, setter: TokenSetter): void {
  getTokenFn = getter;
  setTokenFn = setter;
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
      return refreshQueue.enqueue()
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
        refreshQueue.rejectAll(new Error('Refresh failed'));
        if (setTokenFn) setTokenFn(null);
        return Promise.reject(error);
      }

      if (setTokenFn) setTokenFn(newAccessToken);

      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      refreshQueue.resolveAll(newAccessToken);

      return apiClient(originalRequest);
    } catch (refreshError) {
      refreshQueue.rejectAll(refreshError);
      if (setTokenFn) setTokenFn(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
