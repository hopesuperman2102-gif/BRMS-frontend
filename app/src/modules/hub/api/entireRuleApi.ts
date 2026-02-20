import { ENV } from '../../../config/env';
import { ReviewResponse, VerticalRulesResponse } from '../types/ruleTableTypes';

const BASE = ENV.API_BASE_URL;

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

// ─── In-memory cache ───
let verticalCache: VerticalRulesResponse | null = null;

// ─── API ───

export const rulesTableApi = {

  // ONE call — returns all projects + rules + versions for the vertical
  getVerticalRules: async (vertical_key = 'loan'): Promise<VerticalRulesResponse> => {
    if (verticalCache) return verticalCache;
    const res = await fetch(
      `${BASE}/api/v1/verticals/${vertical_key}/rules`,
      { method: 'GET', headers: JSON_HEADERS },
    );
    const data = await handleResponse<VerticalRulesResponse>(res);
    verticalCache = data;
    return data;
  },

  // Force fresh fetch — bypasses cache
  refreshVerticalRules: async (vertical_key = 'loan'): Promise<VerticalRulesResponse> => {
    verticalCache = null;
    return rulesTableApi.getVerticalRules(vertical_key);
  },

  reviewRuleVersion: async (
    rule_key: string,
    version: string,
    action: 'APPROVED' | 'REJECTED',
    reviewed_by: string,
  ): Promise<ReviewResponse> => {
    const res = await fetch(
      `${BASE}/api/v1/rules/${rule_key}/versions/${version}/review`,
      {
        method: 'PATCH',
        headers: JSON_HEADERS,
        body: JSON.stringify({ action, reviewed_by }),
      },
    );
    const result = await handleResponse<ReviewResponse>(res);
    verticalCache = null;
    return result;
  },

  invalidateCache: () => {
    verticalCache = null;
  },

};