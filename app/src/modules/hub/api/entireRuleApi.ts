import { ENV } from '../../../config/env';
import { ReviewResponse, VerticalRulesResponse } from '../types/ruleTableTypes';
import axiosInstance from '../../auth/Axiosinstance';

const BASE = ENV.API_BASE_URL;

// ─── In-memory cache ───
let verticalCache: VerticalRulesResponse | null = null;

// ─── API ───

export const rulesTableApi = {

  // ONE call — returns all projects + rules + versions for the vertical
  getVerticalRules: async (vertical_key = 'loan'): Promise<VerticalRulesResponse> => {
    if (verticalCache) return verticalCache;
    const res = await axiosInstance.get<VerticalRulesResponse>(
      `${BASE}/api/v1/verticals/${vertical_key}/rules`
    );
    verticalCache = res.data;
    return res.data;
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
    const res = await axiosInstance.patch<ReviewResponse>(
      `${BASE}/api/v1/rules/${rule_key}/versions/${version}/review`,
      { action, reviewed_by }
    );
    verticalCache = null;
    return res.data;
  },    

  invalidateCache: () => {
    verticalCache = null;
  },

};