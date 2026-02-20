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