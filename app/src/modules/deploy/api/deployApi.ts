import { ENV } from '../../../config/env';
import { Rule, DeployedRule } from '../types/featureFlagTypes';

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

export const deployApi = {
  getDashboardSummary: async (vertical_key: string): Promise<DashboardSummary> => {
    if (ENV.ENABLE_LOGGING) {
      console.log('🔄 Fetching dashboard summary for vertical:', vertical_key);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/env/dashboard/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ vertical_key }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch dashboard summary');
    }

    const result = await response.json();
    if (ENV.ENABLE_LOGGING) console.log('✅ Dashboard summary fetched:', result);
    return result;
  },

  getDashboardStats: async (project_key: string, environment: string): Promise<DashboardStats> => {
    if (ENV.ENABLE_LOGGING) {
      console.log('🔄 Fetching dashboard stats for project:', project_key, 'environment:', environment);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/env/dashboard/stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ project_key, env: environment }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch dashboard stats');
    }

    const result = await response.json();
    if (ENV.ENABLE_LOGGING) console.log('✅ Dashboard stats fetched:', result);
    return result;
  },

  getDeploymentRules: async (project_key: string, environment: string): Promise<Rule[]> => {
    if (ENV.ENABLE_LOGGING) {
      console.log('🔄 Fetching deployment rules for project:', project_key, 'environment:', environment);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/bindings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ project_key, env: environment }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch deployment rules');
    }

    const result = await response.json();
    if (ENV.ENABLE_LOGGING) console.log('✅ Deployment rules fetched:', result);
    return result.rules || result.undeployed_approved_versions || [];
  },

  deployRule: async (payload: DeployRulePayload): Promise<DeployRuleResponse> => {
    if (ENV.ENABLE_LOGGING) {
      console.log('🔄 Deploying rule:', payload);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/bindings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to deploy rule');
    }

    const result = await response.json();
    if (ENV.ENABLE_LOGGING) console.log('✅ Rule deployed successfully:', result);
    return result;
  },
};

if (ENV.DEBUG_MODE) {
  console.log('📡 Dashboard API Base URL:', API_BASE_URL);
}