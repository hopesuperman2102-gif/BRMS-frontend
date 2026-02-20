import { ENV } from '../../../config/env';

const API_BASE_URL = ENV.API_BASE_URL;

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface VerticalProjectsResponse {
  vertical_key: string;
  vertical_name: string;
  status: string;
  projects: ProjectView[];
}

// ─── Cache ────────────────────────────────────────────────────────────────────

const TTL_MS = 30_000; // 30 seconds — fresh enough to dedupe simultaneous calls, short enough to reflect updates on tab switch

interface CacheEntry {
  data: VerticalProjectsResponse;
  expiresAt: number;
}

const dataCache   = new Map<string, CacheEntry>();
const inflightCache = new Map<string, Promise<VerticalProjectsResponse>>();

// ─── API ──────────────────────────────────────────────────────────────────────

export const projectsApi = {

  getVerticalProjects: async (
    vertical_key: string,
  ): Promise<VerticalProjectsResponse> => {

    // 1. Return cached data only if still within TTL
    const cached = dataCache.get(vertical_key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    // 2. Return existing in-flight promise — simultaneous callers share ONE fetch
    if (inflightCache.has(vertical_key)) {
      return inflightCache.get(vertical_key)!;
    }

    // 3. New request — cache the promise immediately before awaiting
    const promise = fetch(
      `${API_BASE_URL}/api/v1/verticals/${vertical_key}/projects?status=ACTIVE`,
      { method: 'GET', headers: JSON_HEADERS },
    )
      .then((res) => handleResponse<VerticalProjectsResponse>(res))
      .then((data) => {
        dataCache.set(vertical_key, { data, expiresAt: Date.now() + TTL_MS });
        inflightCache.delete(vertical_key);
        return data;
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
    if (ENV.ENABLE_LOGGING) console.log('🔄 Creating project:', data);
    const res = await fetch(`${API_BASE_URL}/api/v1/projects/`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    projectsApi.invalidateProjectsCache(data.vertical_key);
    if (ENV.ENABLE_LOGGING) console.log('✅ Project created:', result);
    return result;
  },

  deleteProject: async (project_key: string, deleted_by: string) => {
    if (ENV.ENABLE_LOGGING) console.log('🗑 Deleting project:', project_key);
    const res = await fetch(
      `${API_BASE_URL}/api/v1/projects/${project_key}?deleted_by=${deleted_by}`,
      { method: 'DELETE', headers: JSON_HEADERS },
    );
    const result = await handleResponse(res);
    projectsApi.invalidateProjectsCache();
    if (ENV.ENABLE_LOGGING) console.log('✅ Project deleted:', project_key);
    return result;
  },

  updateProject: async (
    project_key: string,
    data: { name: string; description?: string; domain?: string },
  ) => {
    if (ENV.ENABLE_LOGGING) console.log('🔄 Updating project:', project_key, data);
    const res = await fetch(`${API_BASE_URL}/api/v1/projects/${project_key}`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ ...data, updated_by: 'admin' }),
    });
    const result = await handleResponse(res);
    projectsApi.invalidateProjectsCache();
    if (ENV.ENABLE_LOGGING) console.log('✅ Project updated:', result);
    return result;
  },

  checkProjectNameExists: async (name: string, vertical_key: string): Promise<boolean> => {
    try {
      const projects = await projectsApi.getProjectsView(vertical_key);
      return projects.some(
        (p) => p.name.toLowerCase().trim() === name.toLowerCase().trim(),
      );
    } catch (error) {
      if (ENV.ENABLE_LOGGING) console.error('❌ Error checking project name:', error);
      throw error;
    }
  },
};

if (ENV.DEBUG_MODE) {
  console.log('📡 Projects API Base URL:', API_BASE_URL);
}