import { ENV } from "@/config/env";
import axios from 'axios';
import { LoginRequest, LoginResponse, LoginResult } from "@/modules/auth/types/authTypes";

const BASE_URL = ENV.API_BASE_URL;
const authHttp = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export async function loginApi(credentials: LoginRequest): Promise<LoginResult> {
  try {
    const response = await authHttp.post<LoginResponse>('/api/v1/auth/login', credentials);
    return {
      accessToken: response.data.access_token,
      roles: response.data.roles ?? [],
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
      throw new Error(detail || 'Invalid username or password');
    }
    throw error;
  }
}

export async function refreshApi(): Promise<string | null> {
  try {
    const response = await authHttp.post<{ access_token?: string }>(
      '/api/v1/auth/refresh',
      {},
      {
        validateStatus: () => true,
      }
    );

    if (response.status < 200 || response.status >= 300) {
      return null;
    }

    return response.data.access_token ?? null;
  } catch (err) {
    console.log('[refreshApi] network error:', err);
    return null;
  }
}

export async function logoutApi(): Promise<void> {
  try {
    await authHttp.post('/api/v1/auth/logout', {});
  } catch {
    // ignore
  } finally {
    window.location.href = '/login';
  }
}
