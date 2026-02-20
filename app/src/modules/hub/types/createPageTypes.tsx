//Create Project left panel types 

export type CreateProjectLeftPanelProps = {
  isEditMode: boolean;
  onBack: () => void;
};

//Create Project Right Panel Types
export type FormState = {
  name: string;
  description: string;
  domain: string;
};

export type CreateProjectRightPanelProps = {
  isEditMode: boolean;
  form: FormState;
  loading: boolean;
  error: string | null;
  onFieldChange: (field: keyof FormState, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onBack: () => void;
};