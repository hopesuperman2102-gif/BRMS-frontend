// src/api/rulesApi.ts

import { ENV } from '../../../config/env';

const BASE = ENV.API_BASE_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RuleResponse {
  rule_key: string;
  project_key: string;
  name: string;
  description: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  directory?: string;
  version?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const log = (...args: unknown[]) => {
  if (ENV.ENABLE_LOGGING) console.log(...args);
};

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

// ─── API ──────────────────────────────────────────────────────────────────────

export const rulesApi = {

  // ── Create Rule ────────────────────────────────────────────────────────────
  createRule: async (data: {
    project_key: string;
    name: string;
    description: string;
    directory?: string;
  }): Promise<RuleResponse> => {
    log('🔄 Creating rule:', data);
    const res = await fetch(`${BASE}/api/v1/projects/${data.project_key}/rules`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });
    const result = await handleResponse<RuleResponse>(res);
    log('✅ Rule created:', result);
    return result;
  },

  // ── Get Rules By Project ───────────────────────────────────────────────────
  getProjectRules: async (project_key: string): Promise<RuleResponse[]> => {
    log('📋 Fetching rules for project:', project_key);
    const res = await fetch(`${BASE}/api/v1/projects/${project_key}/rules`, {
      method: 'GET',
      headers: JSON_HEADERS,
    });
    const result = await handleResponse<RuleResponse[]>(res);
    log('✅ Rules fetched:', result.length);
    return result;
  },

  // ── Get Single Rule ────────────────────────────────────────────────────────
  getRuleDetails: async (rule_key: string): Promise<RuleResponse> => {
    log('🔄 Fetching rule details:', rule_key);
    const res = await fetch(`${BASE}/api/v1/rules/${rule_key}`, {
      method: 'GET',
      headers: JSON_HEADERS,
    });
    const result = await handleResponse<RuleResponse>(res);
    log('✅ Rule details fetched:', result);
    return result;
  },

  // ── Delete Rule ────────────────────────────────────────────────────────────
  deleteRule: async (rule_key: string): Promise<unknown> => {
    log('🗑️ Deleting rule:', rule_key);
    const res = await fetch(`${BASE}/api/v1/rules/${rule_key}`, {
      method: 'DELETE',
      headers: JSON_HEADERS,
      body: JSON.stringify({ rule_key }),
    });
    const result = await handleResponse<unknown>(res);
    log('✅ Rule deleted:', rule_key);
    return result;
  },

  // ── Update Rule (name / description) ──────────────────────────────────────
  updateRule: async (data: {
    rule_key: string;
    name: string;
    description: string;
    updated_by: string;
  }): Promise<RuleResponse> => {
    log('🔄 Updating rule:', data);
    const res = await fetch(`${BASE}/api/v1/rules/${data.rule_key}`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });
    const result = await handleResponse<RuleResponse>(res);
    log('✅ Rule updated:', result);
    return result;
  },

  // ── Update Rule Directory ──────────────────────────────────────────────────
  updateRuleDirectory: async (data: {
    rule_key: string;
    updated_by: string;
    directory: string;
  }): Promise<RuleResponse> => {
    log('🔄 Updating rule directory:', data);
    const res = await fetch(`${BASE}/api/v1/rules/${data.rule_key}/directory`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ updated_by: data.updated_by, directory: data.directory }),
    });
    const result = await handleResponse<RuleResponse>(res);
    log('✅ Rule directory updated:', result);
    return result;
  },

  // ── Update Rule Name + Directory ───────────────────────────────────────────
  // FIX: was running updateRule and updateRuleDirectory in parallel with
  // Promise.all — both write the same DB record, creating a race condition.
  // Sequential calls ensure the second write always sees the first's result.
  updateRuleNameAndDirectory: async (data: {
    rule_key: string;
    name: string;
    directory: string;
    description?: string;
    updated_by: string;
  }): Promise<{ success: true }> => {
    log('🔄 Updating rule name and directory:', data);

    await rulesApi.updateRule({
      rule_key: data.rule_key,
      name: data.name,
      description: data.description || '',
      updated_by: data.updated_by,
    });

    await rulesApi.updateRuleDirectory({
      rule_key: data.rule_key,
      updated_by: data.updated_by,
      directory: data.directory,
    });

    log('✅ Rule name and directory updated');
    return { success: true };
  },

  // ── Get Rule Versions ──────────────────────────────────────────────────────
  getRuleVersions: async (rule_key: string): Promise<{ version: string }[]> => {
    log('🔄 Fetching versions for rule:', rule_key);
    const res = await fetch(`${BASE}/api/v1/rules/${rule_key}/versions`, {
      method: 'GET',
      headers: JSON_HEADERS,
    });
    const result = await handleResponse<{ version: string }[]>(res);
    log('✅ Rule versions fetched:', result.length);
    return result;
  },
};

if (ENV.DEBUG_MODE) {
  console.log('📡 Rules API Base URL:', BASE);
}