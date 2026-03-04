import { ENV } from '@/config/env';
import axiosInstance from '@/api/apiClient';
import { CacheEntry, ProjectView, VerticalProjectsResponse } from '@/modules/hub/types/hubEndpointsTypes';

const TTL_MS = 30_000;

const dataCache = new Map<string, CacheEntry>();
const inflightCache = new Map<string, Promise<VerticalProjectsResponse>>();

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
        `/api/v1/verticals/${vertical_key}/projects?status=ACTIVE`
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
    const res = await axiosInstance.post('/api/v1/projects/', data);
    projectsApi.invalidateProjectsCache(data.vertical_key);
    return res.data;
  },

  deleteProject: async (project_key: string, deleted_by: string) => {
    const res = await axiosInstance.delete(
      `/api/v1/projects/${project_key}?deleted_by=${deleted_by}`
    );
    projectsApi.invalidateProjectsCache();
    return res.data;
  },

  updateProject: async (
    project_key: string,
    data: { name: string; description?: string; domain?: string },
  ) => {
    const res = await axiosInstance.put(
      `/api/v1/projects/${project_key}`,
      { ...data, updated_by: 'admin' }
    );
    projectsApi.invalidateProjectsCache();
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

