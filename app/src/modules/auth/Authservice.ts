import { ENV } from "app/src/config/env";

const BASE_URL = ENV.API_BASE_URL;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function loginApi(credentials: LoginRequest): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.detail || 'Invalid username or password');
  }

  const data: LoginResponse = await response.json();
  return data.access_token;
}

export async function refreshApi(): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // browser sends httpOnly cookie automatically
    });

    console.log('[refreshApi] status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('[refreshApi] failed:', errorData);
      return null;
    }

    const data: LoginResponse = await response.json();
    console.log('[refreshApi] success, new access_token received');
    return data.access_token;
  } catch (err) {
    console.log('[refreshApi] network error:', err);
    return null;
  }
}

export async function logoutApi(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // ignore
  } finally {
    window.location.href = '/login';
  }
}