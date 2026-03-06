// ruleTable Types
export type ApprovalStatus = 'Approved' | 'Pending' | 'Rejected';

export type ProjectRuleRow = {
  id: string;
  name: string;
  version: string;
  projectStatus: string;
  approvalStatus: ApprovalStatus;
  rule_key: string;
  project_key: string;
  isEmptyState?: boolean;
};

export type ProjectSection = {
  key: string;
  title: string;
  showHeader: boolean;
  rows: ProjectRuleRow[];
};

export interface RuleVersion {
  version: string;
  status: string;
  created_at: string;
}

export interface VerticalRule {
  rule_key: string;
  rule_name: string;
  status: string;
  directory?: string;
  versions: RuleVersion[];
  description?: string;
  created_by?: string;
  created_at?: string;
  updated_by?: string | null;
  updated_at?: string;
}

export interface VerticalProject {
  project_key: string;
  project_name: string;
  rules: VerticalRule[];
}

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

//project list card types
export type ProjectListProps = {
  id: string;
  project_key: string;
  name: string;
  description?: string;
  domain?: string;
  updatedAt: string;
};

export interface ProjectListLeftPanelProps {
  projects: ProjectListProps[];
  hoveredProject: ProjectListProps | null;
}

export interface ProjectListRightPanelProps {
  loading: boolean;
  paginatedProjects: ProjectListProps[];
  totalPages: number;
  page: number;
  menuAnchorEl: null | HTMLElement;
  onPageChange: (page: number) => void;
  onOpenProject: (project: ProjectListProps) => void;
  onMenuOpen: (e: React.MouseEvent, project: ProjectListProps) => void;
  onMenuClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNewProject: () => void;
  onHoverProject: (project: ProjectListProps | null) => void;
  /** When true, hides the context menu (Edit/Delete) and New Project button */
  isRuleAuthor?: boolean;
}

//Rules Drawer Types
export type ReviewRow = ProjectRuleRow & { projectName: string };

export interface RulesDrawerProps {
  selectedRow: ReviewRow | null;
  canReview: boolean;
}