const API_BASE_URL = 'http://127.0.0.1:8000';

export const projectsApi = {
  // Create a new project (saves to PostgreSQL via backend)
  createProject: async (data: {
    name: string;
    description: string;
    domain: string;
  }) => {
    const requestBody = {
      project_key: "sam",
      //  change project_key every time some new value to avoid conflict
      name: data.name,
      description: data.description,
      domain: data.domain,
      owner_team: 'Credit Risk',
      created_by: 'admin',
    };

    const response = await fetch(`${API_BASE_URL}/projects/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create project');
    }

    return await response.json();
  },

  // Get all projects from PostgreSQL
  getProjects: async () => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
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

    return await response.json();
  },

  // Delete a project from PostgreSQL
  deleteProject: async (id: number | string) => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete project');
    }

    return await response.json();
  },
};