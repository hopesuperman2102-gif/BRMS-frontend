import { ENV } from '../../../config/env';
import { ProjectView, VerticalProjectsResponse } from '../types/projectListTypes';
import axiosInstance from '../../auth/Axiosinstance';

const API_BASE_URL = ENV.API_BASE_URL;

// ─── Cache ────────────────────────────────────────────────────────────────────

const TTL_MS = 30_000;

interface CacheEntry {
  data: VerticalProjectsResponse;
  expiresAt: number;
}

const dataCache = new Map<string, CacheEntry>();
const inflightCache = new Map<string, Promise<VerticalProjectsResponse>>();

// ─── API ──────────────────────────────────────────────────────────────────────

export const projectsApi = {

  getVerticalProjects: async (vertical_key: string): Promise<VerticalProjectsResponse> => {

    // 1. Return cached data only if still within TTL
    const cached = dataCache.get(vertical_key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    // 2. Return existing in-flight promise
    if (inflightCache.has(vertical_key)) {
      return inflightCache.get(vertical_key)!;
    }

    // 3. New request
    const promise = axiosInstance
      .get<VerticalProjectsResponse>(
        `${API_BASE_URL}/api/v1/verticals/${vertical_key}/projects?status=ACTIVE`
      )
      .then((res) => {
        dataCache.set(vertical_key, { data: res.data, expiresAt: Date.now() + TTL_MS });
        inflightCache.delete(vertical_key);
        return res.data;
      })
      .catch((err) => {
        inflightCache.delete(vertical_key);
        throw err;
      });

    inflightCache.set(vertical_key, promise);
    return promise;
  },

  getProjectsView: async (vertical_key: string): Promise<ProjectView[]> => {
    const data = await projectsApi.getVerticalProjects(vertical_key);
    return data.projects;
  },

  invalidateProjectsCache: (vertical_key?: string) => {
    if (vertical_key) {
      dataCache.delete(vertical_key);
      inflightCache.delete(vertical_key);
    } else {
      dataCache.clear();
      inflightCache.clear();
    }
  },

  createProject: async (data: {
    name: string;
    description: string;
    vertical_key: string;
    domain: string;
  }) => {
    if (ENV.ENABLE_LOGGING) console.log('Creating project:', data);
    const res = await axiosInstance.post(`${API_BASE_URL}/api/v1/projects/`, data);
    projectsApi.invalidateProjectsCache(data.vertical_key);
    if (ENV.ENABLE_LOGGING) console.log('Project created:', res.data);
    return res.data;
  },

  deleteProject: async (project_key: string, deleted_by: string) => {
    if (ENV.ENABLE_LOGGING) console.log('Deleting project:', project_key);
    const res = await axiosInstance.delete(
      `${API_BASE_URL}/api/v1/projects/${project_key}?deleted_by=${deleted_by}`
    );
    projectsApi.invalidateProjectsCache();
    if (ENV.ENABLE_LOGGING) console.log('Project deleted:', project_key);
    return res.data;
  },

  updateProject: async (
    project_key: string,
    data: { name: string; description?: string; domain?: string },
  ) => {
    if (ENV.ENABLE_LOGGING) console.log('Updating project:', project_key, data);
    const res = await axiosInstance.put(
      `${API_BASE_URL}/api/v1/projects/${project_key}`,
      { ...data, updated_by: 'admin' }
    );
    projectsApi.invalidateProjectsCache();
    if (ENV.ENABLE_LOGGING) console.log('Project updated:', res.data);
    return res.data;
  },

  checkProjectNameExists: async (name: string, vertical_key: string): Promise<boolean> => {
    try {
      const projects = await projectsApi.getProjectsView(vertical_key);
      return projects.some(
        (p) => p.name.toLowerCase().trim() === name.toLowerCase().trim(),
      );
    } catch (error) {
      if (ENV.ENABLE_LOGGING) console.error('Error checking project name:', error);
      throw error;
    }
  },
};

if (ENV.DEBUG_MODE) {
  console.log('Projects API Base URL:', API_BASE_URL);
}