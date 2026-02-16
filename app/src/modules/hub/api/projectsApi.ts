// src/api/projectsApi.ts

import { ENV } from '../../../config/env';

const API_BASE_URL = ENV.API_BASE_URL;

export interface ProjectView {
  id: string;
  project_key: string;
  name: string;
  description?: string;
  domain?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export const projectsApi = {
  // Creates a new project
  createProject: async (data: {
    name: string;
    description: string;
    vertical_key: string; 
    domain: string;
  }) => {
    const requestBody = {
      name: data.name,
      description: data.description,
      domain: data.domain,
      vertical_key: data.vertical_key, 
    };

    if (ENV.ENABLE_LOGGING) {
      console.log('🔄 Creating project:', requestBody);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects/`, {
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

    const result = await response.json();
    
    if (ENV.ENABLE_LOGGING) {
      console.log('✅ Project created:', result);
    }

    return result;
  },

  // Get all projects
  getProjectsView: async (vertical_key: string): Promise<ProjectView[]> => {
    if (ENV.ENABLE_LOGGING) {
      console.log('🔄 Fetching active projects for vertical:', vertical_key);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects/vertical/${vertical_key}/?status=ACTIVE`, {
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

    const result = (await response.json()) as ProjectView[];

    if (ENV.ENABLE_LOGGING) {
      console.log('✅ Projects fetched:', result.length);
    }

    return result;
  },

  // Delete a project
  deleteProject: async (project_key: string, deleted_by: string) => {
    if (ENV.ENABLE_LOGGING) {
      console.log(' Deleting project:', project_key);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${project_key}?deleted_by=${deleted_by}`, {
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

    const result = await response.json();

    if (ENV.ENABLE_LOGGING) {
      console.log('✅ Project deleted:', project_key);
    }

    return result;
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
    if (ENV.ENABLE_LOGGING) {
      console.log('🔄 Updating project:', project_key, data);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${project_key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        updated_by: 'admin',
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update project');
    }

    const result = await response.json();

    if (ENV.ENABLE_LOGGING) {
      console.log('✅ Project updated:', result);
    }

    return result;
  },

  // Check if project name exists
  checkProjectNameExists: async (name: string , vertical_key: string): Promise<boolean> => {
    try {
      const projects = await projectsApi.getProjectsView(vertical_key);
      return projects.some(
        (p) => p.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
    } catch (error) {
      if (ENV.ENABLE_LOGGING) {
        console.error('❌ Error checking project name:', error);
      }
      throw error;
    }
  },
};

// Log API endpoint in development
if (ENV.DEBUG_MODE) {
  console.log('📡 Projects API Base URL:', API_BASE_URL);
}