const API_BASE_URL = 'http://127.0.0.1:8000';

export const projectsApi = {
  // Creates a new project
  createProject: async (data: {
    name: string;
    description: string;
    domain: string;
  }) => {
    const requestBody = {
      name: data.name,
      description: data.description,
      domain: data.domain,
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

  // Get all projects
  getProjectsView: async () => {
    const response = await fetch(`${API_BASE_URL}/projects/view/active`, {
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

  // Delete a project
  deleteProject: async (project_key: string) => {
    const response = await fetch(`${API_BASE_URL}/projects/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        project_key,
        deleted_by: 'admin',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete project');
    }

    return await response.json();
  },

  // Update Project Details
  updateProject: async (
    project_key: string,
    data: {
      name: string;
      description?: string;
      domain?: string;
    }
  ) => {
    const response = await fetch(`${API_BASE_URL}/projects/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_key,
        ...data,
        updated_by: 'admin',
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update project');
    }

    return response.json();
  },

  // Check if project name exists
  checkProjectNameExists: async (name: string): Promise<boolean> => {
    try {
      const projects = await projectsApi.getProjectsView();
      return projects.some(
        (p: any) => p.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
    } catch (error) {
      console.error('Error checking project name:', error);
      throw error;
    }
  },
};