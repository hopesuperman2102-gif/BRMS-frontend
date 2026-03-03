import { UserManagementResponse } from "@/modules/UserLifecycle/types/userEndpointsTypes";

// CreateUserLeftPanel Props
export interface CreateUserLeftPanelProps {
  newUser?: UserManagementResponse | null;
}

// CreateUserRightPanel Props
export interface CreateUserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  roles: string[];
}

export interface CreateUserRightPanelProps {
  formData: CreateUserFormData;
  loading: boolean;
  error: string;
  success: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleSelect: (role: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

// UpdatePasswordDialog Props
export interface UpdatePasswordDialogProps {
  open: boolean;
  userId: string | null;
  onClose: () => void;
  onChangePassword: (userId: string, newPassword: string) => Promise<unknown>;
}

// UserListCard Props
export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  created_at: string;
}

export interface UserListCardProps {
  /** Pass a freshly-created user to append it to the list without a refetch */
  newUser?: UserManagementResponse | null;
}