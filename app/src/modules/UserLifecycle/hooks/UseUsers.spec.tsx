import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUsers } from './useUsers';
import type { UserManagementResponse } from '@/modules/UserLifecycle/types/userEndpointsTypes';

// ─── Mock CreateUserApi ───────────────────────────────────────────────────────
const mockGetUsers = vi.fn();
const mockDeleteUser = vi.fn();

vi.mock('@/modules/UserLifecycle/api/createUserApi', () => ({
  CreateUserApi: {
    getUsers: (...args: unknown[]) => mockGetUsers(...args),
    deleteUser: (...args: unknown[]) => mockDeleteUser(...args),
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const mockUsers: UserManagementResponse[] = [
  {
    id: 'user-1',
    username: 'alice',
    email: 'alice@test.com',
    roles: ['VIEWER'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    username: 'bob',
    email: 'bob@test.com',
    roles: ['ADMIN'],
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
];

const newMockUser: UserManagementResponse = {
  id: 'user-3',
  username: 'carol',
  email: 'carol@test.com',
  roles: ['REVIEWER'],
  created_at: '2024-03-01T00:00:00Z',
  updated_at: '2024-03-01T00:00:00Z',
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('useUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: getUsers returns array form
    mockGetUsers.mockResolvedValue(mockUsers);
    mockDeleteUser.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Initial fetch ──────────────────────────────────────────────────────────
  describe('Initial fetch', () => {
    it('starts with loading=true before fetch resolves', () => {
      // Don't resolve immediately so we can inspect loading state
      mockGetUsers.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useUsers(undefined));
      expect(result.current.loading).toBe(true);
    });

    it('sets loading=false after fetch resolves', async () => {
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('populates users after successful fetch (array response)', async () => {
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.users).toEqual(mockUsers);
    });

    it('populates users when response is object with .users property', async () => {
      mockGetUsers.mockResolvedValue({ users: mockUsers });
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.users).toEqual(mockUsers);
    });

    it('sets users to [] when response is object without .users', async () => {
      mockGetUsers.mockResolvedValue({});
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.users).toEqual([]);
    });

    it('clears error after successful fetch', async () => {
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe('');
    });

    it('calls CreateUserApi.getUsers with page=1 and limit=100', async () => {
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockGetUsers).toHaveBeenCalledWith(1, 100);
    });
  });

  // ── Fetch error handling ───────────────────────────────────────────────────
  describe('Fetch error handling', () => {
    it('sets error message when getUsers rejects with an Error', async () => {
      mockGetUsers.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe('Network error');
    });

    it('sets fallback error message when rejection is not an Error instance', async () => {
      mockGetUsers.mockRejectedValue('unknown');
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe('Failed to fetch users');
    });

    it('sets users to [] when getUsers rejects', async () => {
      mockGetUsers.mockRejectedValue(new Error('fail'));
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.users).toEqual([]);
    });

    it('sets loading=false after fetch rejects', async () => {
      mockGetUsers.mockRejectedValue(new Error('fail'));
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
    });
  });

  // ── Manual fetchUsers ──────────────────────────────────────────────────────
  describe('Manual fetchUsers call', () => {
    it('re-fetches users when fetchUsers is called manually', async () => {
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockGetUsers).toHaveBeenCalledTimes(1);

      const updatedUsers = [...mockUsers, newMockUser];
      mockGetUsers.mockResolvedValue(updatedUsers);

      await act(async () => {
        await result.current.fetchUsers();
      });

      expect(mockGetUsers).toHaveBeenCalledTimes(2);
      expect(result.current.users).toEqual(updatedUsers);
    });

    it('sets loading=true during manual fetchUsers', async () => {
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let resolveSecond!: (v: UserManagementResponse[]) => void;
      mockGetUsers.mockReturnValueOnce(
        new Promise<UserManagementResponse[]>((res) => { resolveSecond = res; })
      );

      act(() => { void result.current.fetchUsers(); });
      expect(result.current.loading).toBe(true);
      await act(async () => { resolveSecond(mockUsers); });
    });

    it('clears previous error on successful manual re-fetch', async () => {
      mockGetUsers.mockRejectedValueOnce(new Error('First fail'));
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.error).toBe('First fail'));

      mockGetUsers.mockResolvedValueOnce(mockUsers);
      await act(async () => {
        await result.current.fetchUsers();
      });

      expect(result.current.error).toBe('');
      expect(result.current.users).toEqual(mockUsers);
    });
  });

  // ── newUser prop ───────────────────────────────────────────────────────────
  describe('newUser prop', () => {
    it('does not append user when newUser is undefined', async () => {
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.users).toEqual(mockUsers);
    });

    it('does not append user when newUser is null', async () => {
      const { result } = renderHook(() => useUsers(null));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.users).toEqual(mockUsers);
    });

    it('appends newUser to users list when newUser is provided on mount', async () => {
      // The newUser useEffect runs after the fetch useEffect on mount.
      // fetchUsers sets users to mockUsers, then the newUser effect appends newMockUser.
      // We need to wait for the fetch to finish first, then trigger a rerender so
      // the newUser effect runs with a stable newUser value after the list is populated.
      let currentNewUser: UserManagementResponse | undefined = undefined;
      const { result, rerender } = renderHook(() => useUsers(currentNewUser ?? null));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Now set newUser — this triggers the useEffect([newUser]) with the populated list
      currentNewUser = newMockUser;
      act(() => { rerender(); });

      expect(result.current.users).toContainEqual(newMockUser);
      expect(result.current.users).toHaveLength(mockUsers.length + 1);
    });

    it('appends newUser when prop changes from null to a user', async () => {
      let newUser: UserManagementResponse | null = null;
      const { result, rerender } = renderHook(() => useUsers(newUser));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.users).toHaveLength(mockUsers.length);

      newUser = newMockUser;
      act(() => { rerender(); });

      expect(result.current.users).toContainEqual(newMockUser);
      expect(result.current.users).toHaveLength(mockUsers.length + 1);
    });

    it('does not duplicate user when newUser prop reference stays the same', async () => {
      const { result, rerender } = renderHook(() => useUsers(newMockUser));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const countBefore = result.current.users.filter((u) => u.id === newMockUser.id).length;

      act(() => { rerender(); });
      const countAfter = result.current.users.filter((u) => u.id === newMockUser.id).length;
      expect(countAfter).toBe(countBefore);
    });
  });

  // ── deleteUserById ─────────────────────────────────────────────────────────
  describe('deleteUserById', () => {
    it('removes the user from the list on success', async () => {
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteUserById('user-1');
      });

      expect(result.current.users.find((u) => u.id === 'user-1')).toBeUndefined();
    });

    it('keeps other users after deletion', async () => {
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteUserById('user-1');
      });

      expect(result.current.users.find((u) => u.id === 'user-2')).toBeDefined();
    });

    it('calls CreateUserApi.deleteUser with the correct userId', async () => {
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteUserById('user-1');
      });

      expect(mockDeleteUser).toHaveBeenCalledWith('user-1');
    });

    it('clears error after successful deletion', async () => {
      mockGetUsers.mockRejectedValueOnce(new Error('old error'));
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));

      mockGetUsers.mockResolvedValue(mockUsers);
      await act(async () => { await result.current.fetchUsers(); });

      await act(async () => {
        await result.current.deleteUserById('user-1');
      });

      expect(result.current.error).toBe('');
    });

    it('sets error message when deleteUser rejects with an Error', async () => {
      mockDeleteUser.mockRejectedValue(new Error('Delete failed'));
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Catch rejection manually so act() flushes state updates before we assert
      await act(async () => {
        try { await result.current.deleteUserById('user-1'); } catch { /* expected */ }
      });

      expect(result.current.error).toBe('Delete failed');
    });

    it('sets fallback error when deleteUser rejects with non-Error', async () => {
      mockDeleteUser.mockRejectedValue('boom');
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        try { await result.current.deleteUserById('user-1'); } catch { /* expected */ }
      });

      expect(result.current.error).toBe('Failed to delete user');
    });

    it('rethrows the error so the caller can handle it', async () => {
      const err = new Error('rethrow me');
      mockDeleteUser.mockRejectedValue(err);
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await expect(
        act(async () => {
          await result.current.deleteUserById('user-1');
        })
      ).rejects.toThrow('rethrow me');
    });

    it('does not remove other users when deletion fails', async () => {
      mockDeleteUser.mockRejectedValue(new Error('fail'));
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await expect(
        act(async () => {
          await result.current.deleteUserById('user-1');
        })
      ).rejects.toThrow();

      expect(result.current.users).toEqual(mockUsers);
    });
  });

  // ── Return shape ───────────────────────────────────────────────────────────
  describe('Return shape', () => {
    it('returns all expected keys', async () => {
      const { result } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current).toHaveProperty('users');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('fetchUsers');
      expect(result.current).toHaveProperty('deleteUserById');
    });

    it('fetchUsers is a stable reference (useCallback)', async () => {
      const { result, rerender } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const first = result.current.fetchUsers;
      act(() => { rerender(); });
      expect(result.current.fetchUsers).toBe(first);
    });

    it('deleteUserById is a stable reference (useCallback)', async () => {
      const { result, rerender } = renderHook(() => useUsers(undefined));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const first = result.current.deleteUserById;
      act(() => { rerender(); });
      expect(result.current.deleteUserById).toBe(first);
    });
  });
});