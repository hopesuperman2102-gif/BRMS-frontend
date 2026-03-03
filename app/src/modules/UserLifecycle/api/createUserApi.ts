import axiosInstance from '@/api/apiClient';
import { UserManagementResponse } from '@/modules/UserLifecycle/types/userEndpointsTypes';

export const CreateUserApi = {

  createUser: async (data: {
    username: string;
    email: string;
    password: string;
    roles: string[];
  }): Promise<UserManagementResponse> => {
    const res = await axiosInstance.post<UserManagementResponse>(
      '/api/v1/users',
      data
    );
    return res.data;
  },

  getUsers: async (page = 1, pageSize = 10): Promise<{ users: UserManagementResponse[]; total: number }> => {
    const res = await axiosInstance.get<{ users: UserManagementResponse[]; total: number }>(
      '/api/v1/users',
      {
        params: { page, pageSize },
      }
    );
    return res.data;
  },

  getUserById: async (userId: string): Promise<UserManagementResponse> => {
    const res = await axiosInstance.get<UserManagementResponse>(
      `/api/v1/users/${userId}`
    );
    return res.data;
  },

  updateUser: async (userId: string, data: {
    username?: string;
    email?: string;
    password?: string;
    roles?: string[];
  }): Promise<UserManagementResponse> => {
    const res = await axiosInstance.put<UserManagementResponse>(
      `/api/v1/users/${userId}`,
      data
    );
    return res.data;
  },

  deleteUser: async (userId: string): Promise<unknown> => {
    const res = await axiosInstance.delete<unknown>(
      `/api/v1/users/${userId}`
    );
    return res.data;
  },

  changePassword: async (userId: string, newPassword: string): Promise<unknown> => {
  const res = await axiosInstance.post<unknown>(
    '/api/v1/users/change-password',
    { new_password: newPassword }
  );
  return res.data;
},

};

