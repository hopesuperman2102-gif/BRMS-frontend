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