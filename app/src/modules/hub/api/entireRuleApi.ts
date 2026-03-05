import axiosInstance from '@/api/apiClient';
import { ReviewResponse, VerticalRulesResponse } from '@/modules/hub/types/hubEndpointsTypes';

const verticalCache = new Map<string, VerticalRulesResponse>();

export const rulesTableApi = {

  // ONE call — returns all projects + rules + versions for the vertical
  getVerticalRules: async (vertical_key: string): Promise<VerticalRulesResponse> => {
    const cached = verticalCache.get(vertical_key);
    if (cached) return cached;
    const res = await axiosInstance.get<VerticalRulesResponse>(
      `/api/v1/verticals/${vertical_key}/rules`
    );
    verticalCache.set(vertical_key, res.data);
    return res.data;
  },

  // Force fresh fetch — bypasses cache
  refreshVerticalRules: async (vertical_key: string): Promise<VerticalRulesResponse> => {
    verticalCache.delete(vertical_key);
    return rulesTableApi.getVerticalRules(vertical_key);
  },

  reviewRuleVersion: async (
    rule_key: string,
    version: string,
    action: 'APPROVED' | 'REJECTED',
    reviewed_by: string,
  ): Promise<ReviewResponse> => {
    const res = await axiosInstance.patch<ReviewResponse>(
      `/api/v1/rules/${rule_key}/versions/${version}/review`,
      { action, reviewed_by }
    );
    verticalCache.clear();
    return res.data;
  },    

  invalidateCache: (vertical_key?: string) => {
    if (vertical_key) {
      verticalCache.delete(vertical_key);
      return;
    }
    verticalCache.clear();
  },

};

