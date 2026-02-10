const API_BASE_URL = 'http://127.0.0.1:8000';

export const rulesApi = {
  // ---------- Create Rule ----------
  createRule: async (data: {
    project_key: string;
    name: string;
    description: string;
    //type?: 'file' | 'folder'; //for folder structure 
    //parent_id?: string | null; 
  }) => {
    const response = await fetch(`${API_BASE_URL}/rules/create`, {
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

    return await response.json();
  },

  // ---------- Get Rules By Project ----------
  getProjectRules: async (project_key: string) => {
    const response = await fetch(`${API_BASE_URL}/rules/project/list`, {
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

    return await response.json();
  },

  // ---------- Delete Rule ----------
  deleteRule: async (rule_key: string) => {
    const response = await fetch(`${API_BASE_URL}/rules/delete`, {
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

    return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/rules/update`, {
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

    return await response.json();
  },

  // ---------- Get Rule Versions ----------
getRuleVersions: async (rule_key: string) => {
  const response = await fetch(
    `${API_BASE_URL}/rule-versions/list`,
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

  return await response.json();
},

};
