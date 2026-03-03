import { ENV } from "@/config/env";
import { LoginRequest, LoginResponse, LoginResult } from "@/modules/auth/types/authTypes";

const BASE_URL = ENV.API_BASE_URL;

export async function loginApi(credentials: LoginRequest): Promise<LoginResult> {
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
  return {
    accessToken: data.access_token,
    roles: data.roles ?? [],
  };
}

export async function refreshApi(): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
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
