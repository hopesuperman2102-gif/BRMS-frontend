
import type { DecisionGraphType } from '@gorules/jdm-editor';
import axiosInstance from '@/api/apiClient';
import { CreateRuleVersionRequest, JdmRuleVersion } from '@/modules/JdmEditorPage/types/jdmEditorEndpointsTypes';


export const ruleVersionsApi = {

  listVersions: async (rule_key: string): Promise<JdmRuleVersion[]> => {
    try {
      const response = await axiosInstance.get(`/api/v1/rules/${rule_key}/versions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rule versions:', error);
      throw error;
    }
  },

  /**
   * Create a new version for a rule
   */
  createVersion: async (data: CreateRuleVersionRequest): Promise<JdmRuleVersion> => {
    try {
      const response = await axiosInstance.post(`/api/v1/rules/${data.rule_key}/versions`, data);
      return response.data as JdmRuleVersion;
    } catch (error) {
      console.error('Error creating rule version:', error);
      throw error;
    }
  },

  // Get a specific version's JDM data
  getVersionData: async (
    rule_key: string,
    version: string
  ): Promise<{ jdm: DecisionGraphType }> => {
    try {
      const response = await axiosInstance.get(`/api/v1/rules/${rule_key}/versions/${version}`);
      return response.data as { jdm: DecisionGraphType };
    } catch (error) {
      console.error('Error fetching version data:', error);
      throw error;
    }
  },
};



