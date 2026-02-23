import { ENV } from '../../../config/env';
import { ProjectRulesResult, RuleResponse, RuleVersion, VerticalProjectRulesResponse } from '../types/rulesTypes';
import axiosInstance from '../../auth/Axiosinstance';

const BASE = ENV.API_BASE_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLatestVersion(versions: RuleVersion[]): string {
  if (!versions || versions.length === 0) return 'Unversioned';
  const sorted = [...versions].sort((a, b) => {
    const numA = parseInt(a.version.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.version.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });
  return sorted[sorted.length - 1].version;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const rulesApi = {

  getProjectRules: async (
    project_key: string,
    vertical_key: string,
  ): Promise<ProjectRulesResult> => {
    const res = await axiosInstance.get<VerticalProjectRulesResponse>(
      `${BASE}/api/v1/verticals/${vertical_key}/projects/${project_key}/rules`
    );
    const result = res.data;
    const rawRules = Array.isArray(result?.rules) ? result.rules : [];

    const rules: RuleResponse[] = rawRules.map((r) => ({
      rule_key:    r.rule_key,
      project_key,
      name:        r.rule_name ?? '',
      description: r.description ?? '',
      status:      r.status ?? 'DRAFT',
      created_by:  r.created_by,
      created_at:  r.created_at,
      updated_by:  r.updated_by,
      updated_at:  r.updated_at,
      directory:   r.directory,
      versions:    r.versions ?? [],
      version:     getLatestVersion(r.versions ?? []),
    }));

    return {
      vertical_name: result.vertical_name ?? '',
      project_name:  result.project_name  ?? '',
      rules,
    };
  },

  createRule: async (data: {
    project_key: string;
    name: string;
    description: string;
    directory?: string;
  }): Promise<RuleResponse> => {
    const res = await axiosInstance.post<RuleResponse>(
      `${BASE}/api/v1/projects/${data.project_key}/rules`,
      data
    );
    return res.data;
  },

  getRuleDetails: async (rule_key: string): Promise<RuleResponse> => {
    const res = await axiosInstance.get<RuleResponse>(`${BASE}/api/v1/rules/${rule_key}`);
    return res.data;
  },

  deleteRule: async (rule_key: string): Promise<unknown> => {
    const res = await axiosInstance.delete<unknown>(
      `${BASE}/api/v1/rules/${rule_key}`,
      { data: { rule_key } }
    );
    return res.data;
  },

  updateRule: async (data: {
    rule_key: string;
    name: string;
    description: string;
    updated_by: string;
  }): Promise<RuleResponse> => {
    const res = await axiosInstance.put<RuleResponse>(
      `${BASE}/api/v1/rules/${data.rule_key}`,
      data
    );
    return res.data;
  },

  updateRuleDirectory: async (data: {
    rule_key: string;
    updated_by: string;
    directory: string;
  }): Promise<RuleResponse> => {
    const res = await axiosInstance.put<RuleResponse>(
      `${BASE}/api/v1/rules/${data.rule_key}/directory`,
      { updated_by: data.updated_by, directory: data.directory }
    );
    return res.data;
  },

  updateRuleNameAndDirectory: async (data: {
    rule_key: string;
    name: string;
    directory: string;
    description?: string;
    updated_by: string;
  }): Promise<{ success: true }> => {
    await rulesApi.updateRule({
      rule_key:    data.rule_key,
      name:        data.name,
      description: data.description || '',
      updated_by:  data.updated_by,
    });

    await rulesApi.updateRuleDirectory({
      rule_key:   data.rule_key,
      updated_by: data.updated_by,
      directory:  data.directory,
    });

    return { success: true };
  },

};