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
  status?: 'APPROVED' | 'REJECTED' | 'PENDING';
};

// API functions for RulesTable
export const rulesTableApi = {
  // Get Active Projects
  getActiveProjects: async (): Promise<Project[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/projects/?status=ACTIVE`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch projects');
    }

    return response.json();
  },

  // Get Rules for a Project
  getProjectRules: async (project_key: string): Promise<Rule[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/projects/${project_key}/rules`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch rules');
    }

    return response.json();
  },

  // Get Rule Versions
  getRuleVersions: async (rule_key: string): Promise<RuleVersion[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/rules/${rule_key}/versions`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch rule versions');
    }

    return response.json();
  },

  // Review (Approve / Reject) Rule Version
  reviewRuleVersion: async (
    rule_key: string,
    version: string,
    action: 'APPROVED' | 'REJECTED',
    reviewed_by: string
  ): Promise<{
    rule_key: string;
    version: string;
    status: 'APPROVED' | 'REJECTED' | 'PENDING';
  }> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/rules/${rule_key}/versions/${version}/review`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          action,
          reviewed_by,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update approval status');
    }

    return response.json();
  },
};
