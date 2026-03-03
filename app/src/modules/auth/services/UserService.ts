import axiosInstance from "@/api/apiClient";
import { LoggedInUser, UserResponse } from "@/modules/auth/types/authTypes";

export async function getCurrentUserApi(): Promise<LoggedInUser> {
  try {
    const response = await axiosInstance.get<UserResponse>('/api/v1/users/user');
    return {
      id: response.data.id,
      name: response.data.username,
      email: response.data.email,
      avatar: "",
      roles: response.data.roles ?? [],
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

export async function getUserByIdApi(userId: string): Promise<LoggedInUser> {
  try {
    const response = await axiosInstance.get<UserResponse>(`/api/v1/users/${userId}`);
    return {
      id: response.data.id,
      name: response.data.username,
      email: response.data.email,
      avatar: "",
      roles: response.data.roles ?? [],
    };
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
}

export async function updateUserApi(userId: string, updates: Partial<UserResponse>): Promise<LoggedInUser> {
  try {
    const response = await axiosInstance.put<UserResponse>(
      `/api/v1/users/${userId}`,
      updates
    );
    return {
      id: response.data.id,
      name: response.data.username,
      email: response.data.email,
      avatar: "",
      roles: response.data.roles ?? [],
    };
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
}

