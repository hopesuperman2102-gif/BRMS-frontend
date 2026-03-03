import axiosInstance from '@/api/apiClient';
import { DeployRulePayload, DeployRuleResponse, DeployStats, DeploySummary, EnvironmentLog } from '@/modules/deploy/types/deployEndpointsTypes';
import { Rule } from '@/modules/deploy/types/deployTypes';

export const deployApi = {
  getDashboardSummary: async (vertical_key: string): Promise<DeploySummary> => {
    const res = await axiosInstance.post<DeploySummary>(
      '/api/v1/env/dashboard/summary',
      { vertical_key }
    );
    return res.data;
  },

  getDashboardStats: async (project_key: string, environment: string): Promise<DeployStats> => {
    const res = await axiosInstance.post<DeployStats>(
      '/api/v1/env/dashboard/stats',
      { project_key, env: environment }
    );
    return res.data;
  },

  getDeploymentRules: async (project_key: string, environment: string): Promise<Rule[]> => {
    const res = await axiosInstance.post<{ rules?: Rule[]; undeployed_approved_versions?: Rule[] }>(
      '/api/v1/bindings/',
      { project_key, env: environment }
    );
    return res.data.rules || res.data.undeployed_approved_versions || [];
  },

  deployRule: async (payload: DeployRulePayload): Promise<DeployRuleResponse> => {
    const res = await axiosInstance.post<DeployRuleResponse>(
      '/api/v1/bindings',
      payload
    );
    return res.data;
  },

  revokeRule: async (rule_key: string, version: string, environment: string): Promise<void> => {
    await axiosInstance.delete(
      `/api/v1/bindings/${rule_key}/${version}/${environment}`
    );
  },

  promoteRule: async (rule_key: string, target_env: string, current_env: string): Promise<void> => {
    await axiosInstance.put(
      `/api/v1/bindings/${rule_key}/${current_env}`,
      {
        SetEnvironment: target_env,
        activated_by: 'super_admin',
      }
    );
  },

  getEnvironmentLogs: async (environment: string): Promise<EnvironmentLog[]> => {
    const res = await axiosInstance.get(
      `/api/v1/environment-logs/${environment}`
    );
    const payload = res.data;
    return Array.isArray(payload) ? payload : payload.logs ?? payload.data ?? [];
  },
};

