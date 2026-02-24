//userService.ts
import { ENV } from "app/src/config/env";
import axiosInstance from "./Axiosinstance"; // Your axios instance with interceptors

const BASE_URL = ENV.API_BASE_URL;

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  status: string;
}

export interface LoggedInUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

/**
 * Fetch current logged-in user data
 * Uses axiosInstance so access token is automatically included in headers
 * and token refresh is handled by interceptor
 */
export async function getCurrentUserApi(): Promise<LoggedInUser> {
  try {
    const response = await axiosInstance.get<UserResponse>(`${BASE_URL}/api/v1/users/user`);
    
    // Transform API response to match LoggedInUser interface
    return {
      id: response.data.id,
      name: response.data.username,
      email: response.data.email,
      avatar: "", // API doesn't provide avatar, you can add this later if needed
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

/**
 * Optional: Get user by ID (if you need this later)
 */
export async function getUserByIdApi(userId: string): Promise<LoggedInUser> {
  try {
    const response = await axiosInstance.get<UserResponse>(`${BASE_URL}/api/v1/users/${userId}`);
    
    return {
      id: response.data.id,
      name: response.data.username,
      email: response.data.email,
      avatar: "",
    };
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
}

/**
 * Optional: Update user profile
 */
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
    };
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
}