import axiosInstance from '@/api/apiClient';
import { ReviewResponse, VerticalRulesResponse } from '@/modules/hub/types/hubEndpointsTypes';

let verticalCache: VerticalRulesResponse | null = null;

export const rulesTableApi = {

  // ONE call — returns all projects + rules + versions for the vertical
  getVerticalRules: async (vertical_key = 'loan'): Promise<VerticalRulesResponse> => {
    if (verticalCache) return verticalCache;
    const res = await axiosInstance.get<VerticalRulesResponse>(
      `/api/v1/verticals/${vertical_key}/rules`
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
      `/api/v1/rules/${rule_key}/versions/${version}/review`,
      { action, reviewed_by }
    );
    verticalCache = null;
    return res.data;
  },    

  invalidateCache: () => {
    verticalCache = null;
  },

};

