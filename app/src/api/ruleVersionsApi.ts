// app/src/api/ruleVersionsApi.ts

import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

export interface RuleVersion {
  version: string;
  checksum: string;
  is_valid: boolean;
  created_by: string;
  created_at: string;
  jdm?: any;
}

export interface CreateRuleVersionRequest {
  rule_key: string;
  jdm: any;
}

export interface ListRuleVersionsRequest {
  rule_key: string;
}

export const ruleVersionsApi = {
  /**
   * List all versions for a specific rule
   */
  listVersions: async (rule_key: string): Promise<RuleVersion[]> => {
    try {
      const response = await axios.post(`${BASE_URL}/rule-versions/list`, {
        rule_key,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching rule versions:', error);
      throw error;
    }
  },

  /**
   * Create a new version for a rule
   */
  createVersion: async (data: CreateRuleVersionRequest): Promise<any> => {
    try {
      const response = await axios.post(`${BASE_URL}/rule-versions/create`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating rule version:', error);
      throw error;
    }
  },

  /**
   * Get a specific version's JDM data
   */
  getVersionData: async (rule_key: string, version: string): Promise<any> => {
    try {
      const response = await axios.post(`${BASE_URL}/rule-versions/get`, {
        rule_key,
        version,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching version data:', error);
      throw error;
    }
  },
};