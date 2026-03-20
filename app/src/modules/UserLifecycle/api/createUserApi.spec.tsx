import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// ── Hoist mock objects BEFORE vi.mock calls ────────────────────────────────
const { mockAxiosInstance } = vi.hoisted(() => ({
  mockAxiosInstance: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// ── Module mocks ───────────────────────────────────────────────────────────
vi.mock('@/api/apiClient', () => ({
  default: mockAxiosInstance,
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      isAxiosError: vi.fn(),
    },
    isAxiosError: vi.fn(),
  };
});

// ── Import SUT after mocks ─────────────────────────────────────────────────
import { CreateUserApi } from './createUserApi';

// ── Helpers ────────────────────────────────────────────────────────────────
const makeAxiosError = (status: number, data: unknown) => {
  const err = Object.assign(new Error('AxiosError'), {
    isAxiosError: true,
    response: { status, data },
  });
  vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);
  return err;
};

const mockUser = {
  id: 'user-1',
  username: 'john_doe',
  email: 'john@example.com',
  roles: ['admin'],
};

// ── Tests ──────────────────────────────────────────────────────────────────
describe('CreateUserApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── createUser ─────────────────────────────────────────────────────────
  describe('createUser', () => {
    const payload = {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'secret123',
      roles: ['admin'],
    };

    it('returns data on success', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockUser });

      const result = await CreateUserApi.createUser(payload);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v1/users', payload);
      expect(result).toEqual(mockUser);
    });

    it('throws "email already exists" on 409 with email message', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        makeAxiosError(409, { error: { message: 'email already registered' } })
      );

      await expect(CreateUserApi.createUser(payload)).rejects.toThrow(
        'An account with this email already exists.'
      );
    });

    it('throws "username taken" on 409 with username message', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        makeAxiosError(409, { error: { message: 'username is taken' } })
      );

      await expect(CreateUserApi.createUser(payload)).rejects.toThrow(
        'This username is already taken.'
      );
    });

    it('throws generic conflict on 409 without specific field', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        makeAxiosError(409, { error: { message: 'conflict occurred' } })
      );

      await expect(CreateUserApi.createUser(payload)).rejects.toThrow(
        'A conflict occurred. Please check your details.'
      );
    });

    it('throws first element when error message is an array', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        makeAxiosError(422, { error: { message: ['Validation failed for email'] } })
      );

      await expect(CreateUserApi.createUser(payload)).rejects.toThrow(
        'Validation failed for email'
      );
    });

    it('uses top-level message field as fallback', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        makeAxiosError(400, { message: 'Bad request from server' })
      );

      await expect(CreateUserApi.createUser(payload)).rejects.toThrow(
        'Bad request from server'
      );
    });

    it('throws fallback when error has no readable message', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(makeAxiosError(500, {}));

      await expect(CreateUserApi.createUser(payload)).rejects.toThrow(
        'Failed to create user. Please try again.'
      );
    });

    it('throws fallback for non-axios errors', async () => {
      vi.mocked(axios.isAxiosError).mockReturnValueOnce(false);
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('network error'));

      await expect(CreateUserApi.createUser(payload)).rejects.toThrow(
        'Failed to create user. Please try again.'
      );
    });
  });

  // ── getUsers ───────────────────────────────────────────────────────────
  describe('getUsers', () => {
    it('returns users and total with default pagination', async () => {
      const response = { users: [mockUser], total: 1 };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: response });

      const result = await CreateUserApi.getUsers();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/users', {
        params: { page: 1, pageSize: 10 },
      });
      expect(result).toEqual(response);
    });

    it('accepts custom page and pageSize', async () => {
      const response = { users: [mockUser], total: 50 };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: response });

      const result = await CreateUserApi.getUsers(3, 25);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/users', {
        params: { page: 3, pageSize: 25 },
      });
      expect(result).toEqual(response);
    });

    it('propagates errors', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network failure'));

      await expect(CreateUserApi.getUsers()).rejects.toThrow('Network failure');
    });
  });

  // ── getUserById ────────────────────────────────────────────────────────
  describe('getUserById', () => {
    it('fetches user by id', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockUser });

      const result = await CreateUserApi.getUserById('user-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/users/user-1');
      expect(result).toEqual(mockUser);
    });

    it('propagates errors', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Not found'));

      await expect(CreateUserApi.getUserById('bad-id')).rejects.toThrow('Not found');
    });
  });

  // ── updateUser ─────────────────────────────────────────────────────────
  describe('updateUser', () => {
    const updatePayload = { username: 'jane_doe', roles: ['viewer'] };

    it('sends PUT with correct args and returns data', async () => {
      const updated = { ...mockUser, ...updatePayload };
      mockAxiosInstance.put.mockResolvedValueOnce({ data: updated });

      const result = await CreateUserApi.updateUser('user-1', updatePayload);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/v1/users/user-1', updatePayload);
      expect(result).toEqual(updated);
    });

    it('propagates errors', async () => {
      mockAxiosInstance.put.mockRejectedValueOnce(new Error('Update failed'));

      await expect(CreateUserApi.updateUser('user-1', updatePayload)).rejects.toThrow(
        'Update failed'
      );
    });
  });

  // ── deleteUser ─────────────────────────────────────────────────────────
  describe('deleteUser', () => {
    it('sends DELETE and returns data', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({ data: { success: true } });

      const result = await CreateUserApi.deleteUser('user-1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/v1/users/user-1');
      expect(result).toEqual({ success: true });
    });

    it('propagates errors', async () => {
      mockAxiosInstance.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(CreateUserApi.deleteUser('user-1')).rejects.toThrow('Delete failed');
    });
  });

  // ── changePassword ─────────────────────────────────────────────────────
  describe('changePassword', () => {
    it('posts to change-password with correct body', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { success: true } });

      const result = await CreateUserApi.changePassword('john_doe', 'newPass123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/v1/users/change-password', {
        username: 'john_doe',
        new_password: 'newPass123',
      });
      expect(result).toEqual({ success: true });
    });

    it('propagates errors', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Password change failed'));

      await expect(CreateUserApi.changePassword('john_doe', 'newPass')).rejects.toThrow(
        'Password change failed'
      );
    });
  });
});