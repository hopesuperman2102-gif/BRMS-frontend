import { ENV } from '../../../config/env';
import axiosInstance from '../../auth/Axiosinstance';

const BASE = ENV.API_BASE_URL;

// types/userTypes.ts

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  roles: string[];
  created_by?: string;
  created_at: string;
  updated_by?: string;
  updated_at: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  password?: string;
  roles?: string[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const CreateUserApi = {

  createUser: async (data: {
    username: string;
    email: string;
    password: string;
    roles: string[];
  }): Promise<UserResponse> => {
    const res = await axiosInstance.post<UserResponse>(
      `${BASE}/api/v1/users`,
      data
    );
    return res.data;
  },

  getUsers: async (page = 1, pageSize = 10): Promise<{ users: UserResponse[]; total: number }> => {
    const res = await axiosInstance.get<{ users: UserResponse[]; total: number }>(
      `${BASE}/api/v1/users`,
      {
        params: { page, pageSize },
      }
    );
    return res.data;
  },

  getUserById: async (userId: string): Promise<UserResponse> => {
    const res = await axiosInstance.get<UserResponse>(
      `${BASE}/api/v1/users/${userId}`
    );
    return res.data;
  },

  updateUser: async (userId: string, data: {
    username?: string;
    email?: string;
    password?: string;
    roles?: string[];
  }): Promise<UserResponse> => {
    const res = await axiosInstance.put<UserResponse>(
      `${BASE}/api/v1/users/${userId}`,
      data
    );
    return res.data;
  },

  deleteUser: async (userId: string): Promise<unknown> => {
    const res = await axiosInstance.delete<unknown>(
      `${BASE}/api/v1/users/${userId}`,
      { data: { userId } }
    );
    return res.data;
  },

};