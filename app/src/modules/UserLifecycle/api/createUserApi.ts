import { ENV } from '@/config/env';
import axiosInstance from '@/modules/auth/http/Axiosinstance';
import { UserManagementResponse } from '@/modules/UserLifecycle/types/userEndpointsTypes';

const BASE = ENV.API_BASE_URL;

export const CreateUserApi = {

  createUser: async (data: {
    username: string;
    email: string;
    password: string;
    roles: string[];
  }): Promise<UserManagementResponse> => {
    const res = await axiosInstance.post<UserManagementResponse>(
      `${BASE}/api/v1/users`,
      data
    );
    return res.data;
  },

  getUsers: async (page = 1, pageSize = 10): Promise<{ users: UserManagementResponse[]; total: number }> => {
    const res = await axiosInstance.get<{ users: UserManagementResponse[]; total: number }>(
      `${BASE}/api/v1/users`,
      {
        params: { page, pageSize },
      }
    );
    return res.data;
  },

  getUserById: async (userId: string): Promise<UserManagementResponse> => {
    const res = await axiosInstance.get<UserManagementResponse>(
      `${BASE}/api/v1/users/${userId}`
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
      `${BASE}/api/v1/users/${userId}`,
      data
    );
    return res.data;
  },

  deleteUser: async (userId: string): Promise<unknown> => {
    const res = await axiosInstance.delete<unknown>(
      `${BASE}/api/v1/users/${userId}`
    );
    return res.data;
  },

  changePassword: async (userId: string, newPassword: string): Promise<unknown> => {
  const res = await axiosInstance.post<unknown>(
    `${BASE}/api/v1/users/change-password`,
    { new_password: newPassword }
  );
  return res.data;
},

};
