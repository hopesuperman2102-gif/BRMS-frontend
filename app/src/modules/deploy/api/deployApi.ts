import { ENV } from '../../../config/env';
import { Rule, DeployedRule } from '../types/featureFlagTypes';
import axiosInstance from '../../auth/Axiosinstance';

const API_BASE_URL = ENV.API_BASE_URL;

export interface MonthlyData {
  year: number;
  month: number;
  total: number;
}

export interface DashboardSummary {
  total_active_projects: number;
  active_projects: Array<{ project_key: string; project_name: string }>;
  total_active_rules: number;
}

export interface DashboardStats {
  project_key: string;
  total_rule_versions: number;
  pending_versions: number;
  approved_versions: number;
  rejected_versions: number;
  deployed_versions: number;
  approved_not_deployed_versions: number;
  monthly_deployments: MonthlyData[];
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

export const deployApi = {
  getDashboardSummary: async (vertical_key: string): Promise<DashboardSummary> => {
    const res = await axiosInstance.post<DashboardSummary>(
      `${API_BASE_URL}/api/v1/env/dashboard/summary`,
      { vertical_key }
    );
    return res.data;
  },

  getDashboardStats: async (project_key: string, environment: string): Promise<DashboardStats> => {
    const res = await axiosInstance.post<DashboardStats>(
      `${API_BASE_URL}/api/v1/env/dashboard/stats`,
      { project_key, env: environment }
    );
    return res.data;
  },

  getDeploymentRules: async (project_key: string, environment: string): Promise<Rule[]> => {
    const res = await axiosInstance.post<{ rules?: Rule[]; undeployed_approved_versions?: Rule[] }>(
      `${API_BASE_URL}/api/v1/bindings/`,
      { project_key, env: environment }
    );
    return res.data.rules || res.data.undeployed_approved_versions || [];
  },

  deployRule: async (payload: DeployRulePayload): Promise<DeployRuleResponse> => {
    const res = await axiosInstance.post<DeployRuleResponse>(
      `${API_BASE_URL}/api/v1/bindings`,
      payload
    );
    return res.data;
  },

  revokeRule: async (rule_key: string, version: string, environment: string): Promise<void> => {
    await axiosInstance.delete(
      `${API_BASE_URL}/api/v1/bindings/${rule_key}/${version}/${environment}`
    );
  },

  promoteRule: async (rule_key: string, target_env: string, current_env: string): Promise<void> => {
  await axiosInstance.put(
    `${API_BASE_URL}/api/v1/bindings/${rule_key}/${current_env}`,
    {
      SetEnvironment: target_env,
      activated_by: 'super_admin', // TODO: replace with auth context user
    }
  );
},

getEnvironmentLogs: async (environment: string): Promise<EnvironmentLog[]> => {
    const res = await axiosInstance.get<EnvironmentLog[]>(
      `${API_BASE_URL}/api/v1/environment-logs/${environment}`
    );
    return res.data;
  },
};