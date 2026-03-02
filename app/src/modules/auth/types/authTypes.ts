// LoginRightPanel Props

export interface LoginRightPanelProps {
  formData: { username: string; password: string };
  loading: boolean;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

// AuthContextTypes

export interface AuthContextType {
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  roles: string[];
  setRoles: (roles: string[]) => void;
}

//auth service types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  roles: string[];
}

export interface LoginResult {
  accessToken: string;
  roles: string[];
}

//userTypes 

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  status: string;
  roles: string[];
}

export interface LoggedInUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roles: string[];
}