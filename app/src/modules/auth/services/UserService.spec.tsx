import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockGet = vi.fn();
const mockPut = vi.fn();

vi.mock('@/api/apiClient', () => ({
  default: {
    get: mockGet,
    put: mockPut,
  },
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

const makeUserResponse = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  username: 'alice',
  email: 'alice@example.com',
  roles: ['admin', 'user'],
  ...overrides,
});

const makeExpectedUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  name: 'alice',
  email: 'alice@example.com',
  avatar: '',
  roles: ['admin', 'user'],
  ...overrides,
});

// ── Module under test ─────────────────────────────────────────────────────────

const { getCurrentUserApi, getUserByIdApi, updateUserApi } = await import('./UserService');

// ── getCurrentUserApi ─────────────────────────────────────────────────────────

describe('getCurrentUserApi', () => {
  beforeEach(() => mockGet.mockReset());

  it('returns a mapped LoggedInUser on success', async () => {
    mockGet.mockResolvedValueOnce({ data: makeUserResponse() });

    const result = await getCurrentUserApi();

    expect(result).toEqual(makeExpectedUser());
    expect(mockGet).toHaveBeenCalledOnce();
    expect(mockGet).toHaveBeenCalledWith('/api/v1/users/user');
  });

  it('defaults roles to [] when the server omits the field', async () => {
    mockGet.mockResolvedValueOnce({
      data: makeUserResponse({ roles: undefined }),
    });

    const result = await getCurrentUserApi();

    expect(result.roles).toEqual([]);
  });

  it('always sets avatar to an empty string', async () => {
    mockGet.mockResolvedValueOnce({ data: makeUserResponse() });

    const result = await getCurrentUserApi();

    expect(result.avatar).toBe('');
  });

  it('logs and re-throws when the request fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('network failure');
    mockGet.mockRejectedValueOnce(error);

    await expect(getCurrentUserApi()).rejects.toThrow('network failure');
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching user data:', error);

    consoleSpy.mockRestore();
  });
});

// ── getUserByIdApi ────────────────────────────────────────────────────────────

describe('getUserByIdApi', () => {
  beforeEach(() => mockGet.mockReset());

  it('returns a mapped LoggedInUser for the given userId', async () => {
    mockGet.mockResolvedValueOnce({ data: makeUserResponse() });

    const result = await getUserByIdApi('user-1');

    expect(result).toEqual(makeExpectedUser());
    expect(mockGet).toHaveBeenCalledWith('/api/v1/users/user-1');
  });

  it('interpolates the userId correctly in the URL', async () => {
    mockGet.mockResolvedValueOnce({ data: makeUserResponse({ id: 'abc-99' }) });

    await getUserByIdApi('abc-99');

    expect(mockGet).toHaveBeenCalledWith('/api/v1/users/abc-99');
  });

  it('defaults roles to [] when the server omits the field', async () => {
    mockGet.mockResolvedValueOnce({
      data: makeUserResponse({ roles: undefined }),
    });

    const result = await getUserByIdApi('user-1');

    expect(result.roles).toEqual([]);
  });

  it('always sets avatar to an empty string', async () => {
    mockGet.mockResolvedValueOnce({ data: makeUserResponse() });

    const result = await getUserByIdApi('user-1');

    expect(result.avatar).toBe('');
  });

  it('logs and re-throws when the request fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('not found');
    mockGet.mockRejectedValueOnce(error);

    await expect(getUserByIdApi('user-1')).rejects.toThrow('not found');
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching user user-1:', error);

    consoleSpy.mockRestore();
  });
});

// ── updateUserApi ─────────────────────────────────────────────────────────────

describe('updateUserApi', () => {
  beforeEach(() => mockPut.mockReset());

  it('returns a mapped LoggedInUser after a successful update', async () => {
    const updated = makeUserResponse({ username: 'alice-updated', email: 'new@example.com' });
    mockPut.mockResolvedValueOnce({ data: updated });

    const result = await updateUserApi('user-1', { username: 'alice-updated', email: 'new@example.com' });

    expect(result).toEqual(makeExpectedUser({ name: 'alice-updated', email: 'new@example.com' }));
  });

  it('sends the correct URL and payload', async () => {
    mockPut.mockResolvedValueOnce({ data: makeUserResponse() });
    const updates = { email: 'changed@example.com' };

    await updateUserApi('user-42', updates);

    expect(mockPut).toHaveBeenCalledWith('/api/v1/users/user-42', updates);
  });

  it('interpolates userId correctly in the URL', async () => {
    mockPut.mockResolvedValueOnce({ data: makeUserResponse({ id: 'xyz-7' }) });

    await updateUserApi('xyz-7', {});

    expect(mockPut).toHaveBeenCalledWith('/api/v1/users/xyz-7', {});
  });

  it('defaults roles to [] when the server omits the field', async () => {
    mockPut.mockResolvedValueOnce({
      data: makeUserResponse({ roles: undefined }),
    });

    const result = await updateUserApi('user-1', {});

    expect(result.roles).toEqual([]);
  });

  it('always sets avatar to an empty string', async () => {
    mockPut.mockResolvedValueOnce({ data: makeUserResponse() });

    const result = await updateUserApi('user-1', {});

    expect(result.avatar).toBe('');
  });

  it('logs and re-throws when the request fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('server error');
    mockPut.mockRejectedValueOnce(error);

    await expect(updateUserApi('user-1', {})).rejects.toThrow('server error');
    expect(consoleSpy).toHaveBeenCalledWith('Error updating user user-1:', error);

    consoleSpy.mockRestore();
  });
});