'use client';

import { useCallback, useEffect, useState } from 'react';
import { CreateUserApi } from '@/modules/UserLifecycle/api/createUserApi';
import { User, UserListCardProps } from '@/modules/UserLifecycle/types/userTypes';

type UseUsersResult = {
  users: User[];
  loading: boolean;
  error: string;
  fetchUsers: () => Promise<void>;
  deleteUserById: (userId: string) => Promise<void>;
};

export function useUsers(newUser: UserListCardProps['newUser']): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await CreateUserApi.getUsers(1, 100);
      const list = Array.isArray(response) ? response : response?.users || [];
      setUsers(list);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (newUser) {
      setUsers((prev) => [...prev, newUser]);
    }
  }, [newUser]);

  const deleteUserById = useCallback(async (userId: string) => {
    try {
      await CreateUserApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    deleteUserById,
  };
}
