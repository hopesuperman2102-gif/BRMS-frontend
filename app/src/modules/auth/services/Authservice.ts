import { LoginRequest, LoginResponse, LoginResult } from "@/modules/auth/types/authTypes";
import axiosInstance from "@/modules/auth/http/Axiosinstance";

export async function loginApi(
  credentials: LoginRequest
): Promise<LoginResult> {
  const response = await axiosInstance.post<LoginResponse>(
    "/api/v1/auth/login",
    credentials
  );

  const data = response.data;

  return {
    accessToken: data.access_token,
    roles: data.roles ?? [],
  };
}

export async function refreshApi(): Promise<string | null> {
  try {
    const response = await axiosInstance.post("/api/v1/auth/refresh");
    return response.data.access_token;
  } catch (error) {
    console.error("Refresh failed:", error);
    return null;
  }
}

export async function logoutApi(): Promise<void> {
  await axiosInstance.post("/api/v1/auth/logout");
}