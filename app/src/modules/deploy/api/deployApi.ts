import axiosInstance from '@/api/apiClient';
import {
  DeployRulePayload,
  DeployRuleResponse,
  DeployStats,
  DeploySummary,
  EnvironmentLog,
  RawEnvLogFileMeta,
  RawEnvLogFileResponse,
  RawEnvLogListResponse,
} from '@/modules/deploy/types/deployEndpointsTypes';
import { Rule } from '@/modules/deploy/types/deployTypes';

function formatLocalDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const ENV_LOGS_PAGE_SIZE = 10;
function resolveEnvLogFiles(payload: RawEnvLogListResponse | RawEnvLogFileMeta[]): RawEnvLogFileMeta[] {
  if (Array.isArray(payload)) return payload;
  return payload.data ?? payload.logs ?? [];
}

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

  getEnvironmentLogFiles: async (environment: string, date?: string): Promise<RawEnvLogFileMeta[]> => {
    const day = date ?? formatLocalDateYYYYMMDD(new Date());
    const listRes = await axiosInstance.get<RawEnvLogListResponse | RawEnvLogFileMeta[]>(
      `/api/v1/env-logs/${environment}/date/${day}`
    );
    return resolveEnvLogFiles(listRes.data);
  },

  getEnvironmentLogPage: async (
    environment: string,
    fileKey: string,
    skip = 0,
  ): Promise<{ file_key: string; environment: string; data: string[]; total: number; count: number; skip: number; limit: number }> => {
    const detailRes = await axiosInstance.get<RawEnvLogFileResponse>(
      `/api/v1/env-logs/${environment}/file/${fileKey}`,
      { params: { skip, limit: ENV_LOGS_PAGE_SIZE } }
    );
    const detailPayload = detailRes.data;
    const lines = detailPayload.data ?? detailPayload.logs ?? [];
    return {
      file_key: detailPayload.file_key ?? fileKey,
      environment,
      data: Array.isArray(lines) ? lines : [],
      total: detailPayload.total ?? 0,
      count: detailPayload.count ?? (Array.isArray(lines) ? lines.length : 0),
      skip: detailPayload.skip ?? skip,
      limit: detailPayload.limit ?? ENV_LOGS_PAGE_SIZE,
    };
  },

  getEnvironmentLogs: async (environment: string): Promise<EnvironmentLog[]> => {
    const date = formatLocalDateYYYYMMDD(new Date());
    const files = await deployApi.getEnvironmentLogFiles(environment, date);

    if (!files.length) return [];

    const entries = await Promise.all(
      files.map(async (file): Promise<EnvironmentLog> => {
        const detail = await deployApi.getEnvironmentLogPage(environment, file.file_key, 0);

        return {
          id: file.file_key,
          file_key: file.file_key,
          environment,
          created_at: file.created_at ?? new Date().toISOString(),
          content: detail.data.join('\n'),
        };
      })
    );

    return entries;
  },
};
