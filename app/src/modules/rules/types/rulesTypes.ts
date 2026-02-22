
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

// Rule API types 

export interface RuleVersion {
  version: string;
  status: string;
  created_at: string;
}

export interface RuleResponse {
  rule_key: string;
  project_key?: string;
  name: string;
  description: string;
  status: string;
  created_by?: string;
  created_at?: string;
  updated_by?: string | null;
  updated_at?: string;
  directory?: string;
  version?: string;
  versions?: RuleVersion[];
}

export interface ProjectRulesResult {
  vertical_name: string;
  project_name: string;
  rules: RuleResponse[];
}

export interface VerticalProjectRulesResponse {
  vertical_key: string;
  vertical_name: string;
  project_key: string;
  project_name: string;
  rules: Array<{
    rule_key: string;
    rule_name: string;
    status: string;
    versions: RuleVersion[];
    directory?: string;
    description?: string;
    created_by?: string;
    created_at?: string;
    updated_by?: string | null;
    updated_at?: string;
  }>;
}