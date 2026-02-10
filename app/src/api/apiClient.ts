// src/api/apiClient.ts

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV } from '../config/env';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.IS_PRODUCTION ? 10000 : 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (ENV.ENABLE_LOGGING) {
          console.log(`🚀 [${ENV.ENVIRONMENT}] API Request:`, {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            data: config.data,
          });
        }

        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error: AxiosError) => {
        if (ENV.ENABLE_LOGGING) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (ENV.ENABLE_LOGGING) {
          console.log(`✅ [${ENV.ENVIRONMENT}] API Response:`, {
            url: response.config.url,
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      (error: AxiosError) => {
        if (ENV.ENABLE_LOGGING) {
          console.error(`❌ [${ENV.ENVIRONMENT}] API Error:`, {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          });
        }

        // Handle specific error cases
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token');
          if (ENV.IS_PRODUCTION) {
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  getInstance(): AxiosInstance {
    return this.client;
  }

  // Helper method for non-axios fetch calls
  getBaseUrl(): string {
    return ENV.API_BASE_URL;
  }
}

const apiClientInstance = new ApiClient();
export const apiClient = apiClientInstance.getInstance();
export const API_BASE_URL = apiClientInstance.getBaseUrl();