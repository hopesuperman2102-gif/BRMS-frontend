import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('@/config/env', () => ({
  ENV: { API_BASE_URL: 'http://localhost:8000' },
}));

// We mock the axios module so we can control `axios.create` and `axios.isAxiosError`
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();

  const mockPost = vi.fn();

  const mockInstance = {
    post: mockPost,
  };

  return {
    default: {
      ...actual.default,
      create: vi.fn(() => mockInstance),
      isAxiosError: actual.default.isAxiosError,
    },
    // re-export named so `axios.isAxiosError` keeps working
    isAxiosError: actual.default.isAxiosError,
  };
});

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Returns the mocked `post` spy that lives on the axios instance created
 * inside authApi.ts. We reach it through `axios.create()`'s return value.
 */
function getMockPost() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (axios.create as any).mock.results[0].value.post as ReturnType<typeof vi.fn>;
}

/**
 * Builds a minimal AxiosError-compatible object whose `isAxiosError` flag is
 * set so that `axios.isAxiosError()` returns `true` for it.
 */
function makeAxiosError(
  status: number,
  data: unknown,
  message = 'Request failed',
) {
  const err = new Error(message) as Error & {
    isAxiosError: boolean;
    response: { status: number; data: unknown };
  };
  err.isAxiosError = true;
  err.response = { status, data };
  return err;
}

// ── Module under test ─────────────────────────────────────────────────────────

// Import AFTER all mocks are in place.
const { loginApi, refreshApi, logoutApi } = await import('./Authservice');

// ── loginApi ──────────────────────────────────────────────────────────────────

describe('loginApi', () => {
  let mockPost: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPost = getMockPost();
    mockPost.mockReset();
  });

  it('returns accessToken and roles on a successful response', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        access_token: 'tok-abc',
        roles: ['admin', 'user'],
      },
    });

    const result = await loginApi({ username: 'alice', password: 'secret' });

    expect(result).toEqual({ accessToken: 'tok-abc', roles: ['admin', 'user'] });
    expect(mockPost).toHaveBeenCalledOnce();
    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/login', {
      username: 'alice',
      password: 'secret',
    });
  });

  it('defaults roles to [] when the server omits the field', async () => {
    mockPost.mockResolvedValueOnce({
      data: { access_token: 'tok-xyz' },
    });

    const result = await loginApi({ username: 'bob', password: 'pass' });

    expect(result.roles).toEqual([]);
  });

  it('throws the detail message from an AxiosError response', async () => {
    mockPost.mockRejectedValueOnce(
      makeAxiosError(401, { detail: 'Incorrect credentials' }),
    );

    await expect(loginApi({ username: 'x', password: 'y' })).rejects.toThrow(
      'Incorrect credentials',
    );
  });

  it('throws the fallback message when AxiosError has no detail', async () => {
    mockPost.mockRejectedValueOnce(makeAxiosError(401, {}));

    await expect(loginApi({ username: 'x', password: 'y' })).rejects.toThrow(
      'Invalid username or password',
    );
  });

  it('throws the fallback message when AxiosError response data is undefined', async () => {
    const err = makeAxiosError(500, undefined);
    mockPost.mockRejectedValueOnce(err);

    await expect(loginApi({ username: 'x', password: 'y' })).rejects.toThrow(
      'Invalid username or password',
    );
  });

  it('re-throws non-Axios errors unchanged', async () => {
    const original = new TypeError('network exploded');
    mockPost.mockRejectedValueOnce(original);

    await expect(loginApi({ username: 'x', password: 'y' })).rejects.toThrow(
      'network exploded',
    );
  });
});

// ── refreshApi ────────────────────────────────────────────────────────────────

describe('refreshApi', () => {
  let mockPost: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPost = getMockPost();
    mockPost.mockReset();
  });

  it('returns the access_token string on a 200 response', async () => {
    mockPost.mockResolvedValueOnce({
      status: 200,
      data: { access_token: 'refresh-token-123' },
    });

    const token = await refreshApi();

    expect(token).toBe('refresh-token-123');
    expect(mockPost).toHaveBeenCalledWith(
      '/api/v1/auth/refresh',
      {},
      expect.objectContaining({ validateStatus: expect.any(Function) }),
    );
  });

  it('returns null when the server returns a 2xx but omits access_token', async () => {
    mockPost.mockResolvedValueOnce({ status: 204, data: {} });

    expect(await refreshApi()).toBeNull();
  });

  it('returns null when the server returns a 4xx status', async () => {
    mockPost.mockResolvedValueOnce({ status: 401, data: {} });

    expect(await refreshApi()).toBeNull();
  });

  it('returns null when the server returns a 5xx status', async () => {
    mockPost.mockResolvedValueOnce({ status: 503, data: {} });

    expect(await refreshApi()).toBeNull();
  });

  it('returns null when the server returns status 199 (below 200)', async () => {
    mockPost.mockResolvedValueOnce({ status: 199, data: {} });

    expect(await refreshApi()).toBeNull();
  });

  it('returns null (does not throw) when post rejects', async () => {
    mockPost.mockRejectedValueOnce(new Error('connection refused'));

    expect(await refreshApi()).toBeNull();
  });

  it('passes validateStatus that always returns true', async () => {
    mockPost.mockResolvedValueOnce({ status: 200, data: { access_token: 't' } });

    await refreshApi();

    const callArgs = mockPost.mock.calls[0];
    const config = callArgs[2] as { validateStatus: (s: number) => boolean };
    // The function should return true for any status code
    expect(config.validateStatus(0)).toBe(true);
    expect(config.validateStatus(200)).toBe(true);
    expect(config.validateStatus(500)).toBe(true);
  });
});

// ── logoutApi ─────────────────────────────────────────────────────────────────

describe('logoutApi', () => {
  let mockPost: ReturnType<typeof vi.fn>;
  const originalLocation = window.location;

  beforeEach(() => {
    mockPost = getMockPost();
    mockPost.mockReset();

    // jsdom makes window.location read-only; replace with a writable mock.
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { href: '' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
  });

  it('posts to /api/v1/auth/logout with Bearer header when a token is supplied', async () => {
    mockPost.mockResolvedValueOnce({});

    await logoutApi('my-access-token');

    expect(mockPost).toHaveBeenCalledWith(
      '/api/v1/auth/logout',
      {},
      { headers: { Authorization: 'Bearer my-access-token' } },
    );
  });

  it('posts without extra headers when token is null', async () => {
    mockPost.mockResolvedValueOnce({});

    await logoutApi(null);

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/logout', {}, undefined);
  });

  it('posts without extra headers when token is undefined (no arg)', async () => {
    mockPost.mockResolvedValueOnce({});

    await logoutApi();

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/logout', {}, undefined);
  });

  it('redirects to /login after a successful logout', async () => {
    mockPost.mockResolvedValueOnce({});

    await logoutApi('tok');

    expect(window.location.href).toBe('/login');
  });

  it('still redirects to /login even when the post throws', async () => {
    mockPost.mockRejectedValueOnce(new Error('network error'));

    await logoutApi('tok');

    expect(window.location.href).toBe('/login');
  });

  it('redirects to /login when no token is provided and post throws', async () => {
    mockPost.mockRejectedValueOnce(new Error('server down'));

    await logoutApi();

    expect(window.location.href).toBe('/login');
  });
});