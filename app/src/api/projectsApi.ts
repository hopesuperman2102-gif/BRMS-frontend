const API_BASE_URL = 'http://127.0.0.1:8000';

export const projectsApi = {
  // Create a new project
  createProject: async (data: {
    name: string;
    description: string;
    domain: string;
  }) => {
    const requestBody = {
      project_key: "sample",
      name: data.name,
      description: data.description,
      domain: data.domain,
      owner_team: 'Credit Risk',
      created_by: 'admin',
    };

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    return await response.json();
  },

  // Delete a project
  deleteProject: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }

    return await response.json();
  },
};