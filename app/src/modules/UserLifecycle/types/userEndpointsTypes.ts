export interface UserManagementResponse {
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