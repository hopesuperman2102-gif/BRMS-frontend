/**
 * TokenManager
 * access_token  → sessionStorage (memory-like, cleared on tab/browser close, survives refresh)
 * refresh_token → sessionStorage (same behaviour)
 */

const ACCESS_TOKEN_KEY = 'brms_access_token';
const REFRESH_TOKEN_KEY = 'brms_refresh_token';

export const tokenManager = {
  // ── Access Token ────────────────────────────────────────────────────────────
  setAccessToken(token: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },
  removeAccessToken(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  // ── Refresh Token ───────────────────────────────────────────────────────────
  setRefreshToken(token: string): void {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  getRefreshToken(): string | null {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },
  removeRefreshToken(): void {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // ── Helpers ─────────────────────────────────────────────────────────────────
  saveTokens(accessToken: string, refreshToken: string): void {
    tokenManager.setAccessToken(accessToken);
    tokenManager.setRefreshToken(refreshToken);
  },
  clearTokens(): void {
    tokenManager.removeAccessToken();
    tokenManager.removeRefreshToken();
  },
  isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken();
  },
};