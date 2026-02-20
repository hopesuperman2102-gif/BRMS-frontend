
export type RuleFile = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  version?: string;
  status?: string;
  updatedAt?: string;
  parent_id: string | null;
  directory: string;
  children?: RuleFile[];
};

// ─── Create Rule Left Panel Props ───
export interface CreateRuleLeftPanelProps {
  isEditMode: boolean;
  onBack: () => void;
}

// ─── Create Rule Left Panel Types ────
export type FormState = { name: string; description: string; directory: string };


export interface CreateRuleRightPanelProps {
  isEditMode: boolean;
  form: FormState;
  loading: boolean;
  error: string | null;
  focused: string | null;
  locationLabel: string;
  onFormChange: (field: keyof FormState, value: string) => void;
  onFocus: (field: string) => void;
  onBlur: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  onBack: () => void;
}

export interface ConfirmDialogState {
  open: boolean; 
  title: string; 
  message: string; 
  confirmText: string; 
  onConfirm: () => void;
}