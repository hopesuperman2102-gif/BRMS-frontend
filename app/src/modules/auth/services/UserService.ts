import { ENV } from "app/src/config/env";
import axiosInstance from "../http/Axiosinstance";
import { LoggedInUser, UserResponse } from "../types/authTypes";


const BASE_URL = ENV.API_BASE_URL;

export async function getCurrentUserApi(): Promise<LoggedInUser> {
  try {
    const response = await axiosInstance.get<UserResponse>(`${BASE_URL}/api/v1/users/user`);
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
    const response = await axiosInstance.get<UserResponse>(`${BASE_URL}/api/v1/users/${userId}`);
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
      `${BASE_URL}/api/v1/users/${userId}`,
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