import { DeployedRule, Rule } from "@/modules/deploy/types/deployTypes";

export interface MonthlyDeployData {
  year: number;
  month: number;
  total: number;
}

export interface DeploySummary {
  total_active_projects: number;
  active_projects: Array<{ project_key: string; project_name: string }>;
  total_active_rules: number;
}

export interface DeployStats {
  project_key: string;
  total_rule_versions: number;
  pending_versions: number;
  approved_versions: number;
  rejected_versions: number;
  deployed_versions: number;
  approved_not_deployed_versions: number;
  monthly_deployments: MonthlyDeployData[];
  undeployed_approved_versions: Rule[];
  deployed_rules: DeployedRule[];
}

export interface DeploymentRulesResponse {
  project_key: string;
  environment: string;
  rules: Rule[];
}

export interface DeployRulePayload {
  rule_key: string;
  version: string;
  environment: string;
  activated_by: string;
}

export interface DeployRuleResponse {
  success: boolean;
  message?: string;
  [key: string]: string | boolean | number | null | undefined;
}

export interface EnvironmentLog {
  id: string;
  content: string;
  file_key: string;
  environment: string;
  created_at: string;
}