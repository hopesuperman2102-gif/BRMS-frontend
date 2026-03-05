// LoginRightPanel Props
export interface LoginRightPanelProps {
  formData: { username: string; emailid: string; password: string };
  loginMode: 'username' | 'email';
  setLoginMode: (mode: 'username' | 'email') => void;
  loading: boolean;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}
