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

// rules tables api endpoints types 

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

export interface VerticalRulesResponse {
  vertical_key: string;
  vertical_name: string;
  projects: VerticalProject[];
}

export interface ReviewResponse {
  rule_key: string;
  version: string;
  status: string;
}
