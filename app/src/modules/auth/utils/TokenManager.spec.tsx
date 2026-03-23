import { describe, it, expect, beforeEach } from 'vitest';
import { tokenManager } from './TokenManager';

// jsdom (Vitest's default environment) provides a real sessionStorage
// implementation that persists within a test file. We clear it before
// every test so each case starts from a clean slate.

const ACCESS_KEY = 'brms_access_token';
const REFRESH_KEY = 'brms_refresh_token';

beforeEach(() => {
  sessionStorage.clear();
});

// ── Access Token ──────────────────────────────────────────────────────────────

describe('setAccessToken / getAccessToken', () => {
  it('stores the access token under the correct key', () => {
    tokenManager.setAccessToken('acc-123');

    expect(sessionStorage.getItem(ACCESS_KEY)).toBe('acc-123');
  });

  it('getAccessToken returns the stored token', () => {
    tokenManager.setAccessToken('acc-abc');

    expect(tokenManager.getAccessToken()).toBe('acc-abc');
  });

  it('getAccessToken returns null when no token has been set', () => {
    expect(tokenManager.getAccessToken()).toBeNull();
  });

  it('overwrites a previously stored access token', () => {
    tokenManager.setAccessToken('first');
    tokenManager.setAccessToken('second');

    expect(tokenManager.getAccessToken()).toBe('second');
  });
});

describe('removeAccessToken', () => {
  it('removes an existing access token', () => {
    tokenManager.setAccessToken('acc-to-remove');
    tokenManager.removeAccessToken();

    expect(tokenManager.getAccessToken()).toBeNull();
    expect(sessionStorage.getItem(ACCESS_KEY)).toBeNull();
  });

  it('does not throw when no access token is present', () => {
    expect(() => tokenManager.removeAccessToken()).not.toThrow();
  });
});

// ── Refresh Token ─────────────────────────────────────────────────────────────

describe('setRefreshToken / getRefreshToken', () => {
  it('stores the refresh token under the correct key', () => {
    tokenManager.setRefreshToken('ref-123');

    expect(sessionStorage.getItem(REFRESH_KEY)).toBe('ref-123');
  });

  it('getRefreshToken returns the stored token', () => {
    tokenManager.setRefreshToken('ref-abc');

    expect(tokenManager.getRefreshToken()).toBe('ref-abc');
  });

  it('getRefreshToken returns null when no token has been set', () => {
    expect(tokenManager.getRefreshToken()).toBeNull();
  });

  it('overwrites a previously stored refresh token', () => {
    tokenManager.setRefreshToken('old');
    tokenManager.setRefreshToken('new');

    expect(tokenManager.getRefreshToken()).toBe('new');
  });
});

describe('removeRefreshToken', () => {
  it('removes an existing refresh token', () => {
    tokenManager.setRefreshToken('ref-to-remove');
    tokenManager.removeRefreshToken();

    expect(tokenManager.getRefreshToken()).toBeNull();
    expect(sessionStorage.getItem(REFRESH_KEY)).toBeNull();
  });

  it('does not throw when no refresh token is present', () => {
    expect(() => tokenManager.removeRefreshToken()).not.toThrow();
  });
});

// ── saveTokens ────────────────────────────────────────────────────────────────

describe('saveTokens', () => {
  it('stores both tokens simultaneously', () => {
    tokenManager.saveTokens('acc-save', 'ref-save');

    expect(tokenManager.getAccessToken()).toBe('acc-save');
    expect(tokenManager.getRefreshToken()).toBe('ref-save');
  });

  it('overwrites pre-existing tokens', () => {
    tokenManager.saveTokens('old-acc', 'old-ref');
    tokenManager.saveTokens('new-acc', 'new-ref');

    expect(tokenManager.getAccessToken()).toBe('new-acc');
    expect(tokenManager.getRefreshToken()).toBe('new-ref');
  });

  it('does not affect unrelated sessionStorage keys', () => {
    sessionStorage.setItem('other-key', 'other-value');
    tokenManager.saveTokens('a', 'r');

    expect(sessionStorage.getItem('other-key')).toBe('other-value');
  });
});

// ── clearTokens ───────────────────────────────────────────────────────────────

describe('clearTokens', () => {
  it('removes both tokens', () => {
    tokenManager.saveTokens('acc-clear', 'ref-clear');
    tokenManager.clearTokens();

    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
  });

  it('does not throw when called with no tokens present', () => {
    expect(() => tokenManager.clearTokens()).not.toThrow();
  });

  it('does not affect unrelated sessionStorage keys', () => {
    sessionStorage.setItem('other-key', 'keep-me');
    tokenManager.saveTokens('a', 'r');
    tokenManager.clearTokens();

    expect(sessionStorage.getItem('other-key')).toBe('keep-me');
  });
});

// ── isAuthenticated ───────────────────────────────────────────────────────────

describe('isAuthenticated', () => {
  it('returns true when an access token is present', () => {
    tokenManager.setAccessToken('valid-token');

    expect(tokenManager.isAuthenticated()).toBe(true);
  });

  it('returns false when no access token is present', () => {
    expect(tokenManager.isAuthenticated()).toBe(false);
  });

  it('returns false after the access token has been removed', () => {
    tokenManager.setAccessToken('to-remove');
    tokenManager.removeAccessToken();

    expect(tokenManager.isAuthenticated()).toBe(false);
  });

  it('returns false after clearTokens is called', () => {
    tokenManager.saveTokens('acc', 'ref');
    tokenManager.clearTokens();

    expect(tokenManager.isAuthenticated()).toBe(false);
  });

  it('returns true even when only access token is set (refresh absent)', () => {
    tokenManager.setAccessToken('acc-only');
    // refresh token deliberately not set

    expect(tokenManager.isAuthenticated()).toBe(true);
  });

  it('returns false when only the refresh token is set', () => {
    tokenManager.setRefreshToken('ref-only');
    // access token deliberately not set

    expect(tokenManager.isAuthenticated()).toBe(false);
  });
});

// ── key isolation ─────────────────────────────────────────────────────────────

describe('key isolation', () => {
  it('access and refresh tokens are stored under separate keys', () => {
    tokenManager.setAccessToken('acc-iso');
    tokenManager.setRefreshToken('ref-iso');

    expect(sessionStorage.getItem(ACCESS_KEY)).toBe('acc-iso');
    expect(sessionStorage.getItem(REFRESH_KEY)).toBe('ref-iso');
    expect(sessionStorage.getItem(ACCESS_KEY)).not.toBe(sessionStorage.getItem(REFRESH_KEY));
  });

  it('removing the access token does not affect the refresh token', () => {
    tokenManager.saveTokens('acc', 'ref');
    tokenManager.removeAccessToken();

    expect(tokenManager.getRefreshToken()).toBe('ref');
  });

  it('removing the refresh token does not affect the access token', () => {
    tokenManager.saveTokens('acc', 'ref');
    tokenManager.removeRefreshToken();

    expect(tokenManager.getAccessToken()).toBe('acc');
  });
});