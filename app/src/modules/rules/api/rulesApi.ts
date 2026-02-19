import { ENV } from '../../../config/env';

const BASE = ENV.API_BASE_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

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
    const res = await fetch(
      `${BASE}/api/v1/verticals/${vertical_key}/projects/${project_key}/rules`,
      { method: 'GET', headers: JSON_HEADERS },
    );
    const result = await handleResponse<VerticalProjectRulesResponse>(res);
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
    const res = await fetch(`${BASE}/api/v1/projects/${data.project_key}/rules`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });
    return handleResponse<RuleResponse>(res);
  },

  getRuleDetails: async (rule_key: string): Promise<RuleResponse> => {
    const res = await fetch(`${BASE}/api/v1/rules/${rule_key}`, {
      method: 'GET',
      headers: JSON_HEADERS,
    });
    return handleResponse<RuleResponse>(res);
  },

  deleteRule: async (rule_key: string): Promise<unknown> => {
    const res = await fetch(`${BASE}/api/v1/rules/${rule_key}`, {
      method: 'DELETE',
      headers: JSON_HEADERS,
      body: JSON.stringify({ rule_key }),
    });
    return handleResponse<unknown>(res);
  },

  updateRule: async (data: {
    rule_key: string;
    name: string;
    description: string;
    updated_by: string;
  }): Promise<RuleResponse> => {
    const res = await fetch(`${BASE}/api/v1/rules/${data.rule_key}`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });
    return handleResponse<RuleResponse>(res);
  },

  updateRuleDirectory: async (data: {
    rule_key: string;
    updated_by: string;
    directory: string;
  }): Promise<RuleResponse> => {
    const res = await fetch(`${BASE}/api/v1/rules/${data.rule_key}/directory`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ updated_by: data.updated_by, directory: data.directory }),
    });
    return handleResponse<RuleResponse>(res);
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