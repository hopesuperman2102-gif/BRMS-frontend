// LoginRightPanel Props
export interface LoginRightPanelProps {
  formData: { username: string; password: string };
  loading: boolean;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}
