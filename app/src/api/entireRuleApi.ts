// src/api/rulesTableApi.ts

import { ENV } from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;

// Types specific to RulesTable
export type Project = {
  project_key: string;
  name: string;
  status: string;
};

export type Rule = {
  rule_key: string;
  name: string;
  status: string;
};

export type RuleVersion = {
  version: string;
};

// API functions for RulesTable
export const rulesTableApi = {
  // Get Active Projects
  getActiveProjects: async (): Promise<Project[]> => {
    if (ENV.ENABLE_LOGGING) {
      console.log('🔄 [RulesTable] Fetching active projects');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects/view/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch projects');
    }

    const result = await response.json();

    if (ENV.ENABLE_LOGGING) {
      console.log('✅ [RulesTable] Active projects fetched:', result.length);
    }

    return result;
  },

  // Get Rules for a Project
  getProjectRules: async (project_key: string): Promise<Rule[]> => {
    if (ENV.ENABLE_LOGGING) {
      console.log('🔄 [RulesTable] Fetching rules for project:', project_key);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/rules/project/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ project_key }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch rules');
    }

    const result = await response.json();

    if (ENV.ENABLE_LOGGING) {
      console.log('✅ [RulesTable] Rules fetched:', result.length);
    }

    return result;
  },

  // Get Rule Versions
  getRuleVersions: async (rule_key: string): Promise<RuleVersion[]> => {
    if (ENV.ENABLE_LOGGING) {
      console.log('🔄 [RulesTable] Fetching versions for rule:', rule_key);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/rule-versions/list`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ rule_key }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch rule versions');
    }

    const result = await response.json();

    if (ENV.ENABLE_LOGGING) {
      console.log('✅ [RulesTable] Rule versions fetched:', result.length);
    }

    return result;
  },
};

// Log API endpoint in development
if (ENV.DEBUG_MODE) {
  console.log('📡 [RulesTable] API Base URL:', API_BASE_URL);
}