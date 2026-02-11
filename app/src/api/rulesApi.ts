// src/api/rulesApi.ts

import { ENV } from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;

export const rulesApi = {
  // ---------- Create Rule ----------
  createRule: async (data: {
    project_key: string;
    name: string;
    description: string;
    //type?: 'file' | 'folder'; //for folder structure 
    //parent_id?: string | null; 
  }) => {
    if (ENV.ENABLE_LOGGING) {
      console.log('🔄 Creating rule:', data);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${data.project_key}/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create rule');
    }

    const result = await response.json();

    if (ENV.ENABLE_LOGGING) {
      console.log('Rule created:', result);
    }

    return result;
  },

  // ---------- Get Rules By Project ----------
  getProjectRules: async (project_key: string) => {
    if (ENV.ENABLE_LOGGING) {
      console.log(' Fetching rules for project:', project_key);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${project_key}/rules`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch rules');
    }

    const result = await response.json();

    if (ENV.ENABLE_LOGGING) {
      console.log(' Rules fetched:', result.length);
    }

    return result;
  },

  // ---------- Delete Rule ----------
  deleteRule: async (rule_key: string) => {
    if (ENV.ENABLE_LOGGING) {
      console.log('🔄 Deleting rule:', rule_key);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/rules/${rule_key}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ rule_key }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete rule');
    }

    const result = await response.json();

    if (ENV.ENABLE_LOGGING) {
      console.log('✅ Rule deleted:', rule_key);
    }

    return result;
  },

  // ---------- Update Rule ----------
  updateRule: async (data: {
    rule_key: string;
    name: string;
    description: string;
    updated_by: string;
    //type?: 'file' | 'folder';      // NEW - Optional for folder structure
    //parent_id?: string | null;
  }) => {
    if (ENV.ENABLE_LOGGING) {
      console.log('🔄 Updating rule:', data);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/rules/${data.rule_key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update rule');
    }

    const result = await response.json();

    if (ENV.ENABLE_LOGGING) {
      console.log('✅ Rule updated:', result);
    }

    return result;
  },

  // ---------- Get Rule Versions ----------
  getRuleVersions: async (rule_key: string) => {
    if (ENV.ENABLE_LOGGING) {
      console.log('🔄 Fetching versions for rule:', rule_key);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/rules/${rule_key}/versions`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch rule versions');
    }

    const result = await response.json();

    if (ENV.ENABLE_LOGGING) {
      console.log('✅ Rule versions fetched:', result.length);
    }

    return result;
  },
};

// Log API endpoint in development
if (ENV.DEBUG_MODE) {
  console.log('📡 Rules API Base URL:', API_BASE_URL);
}