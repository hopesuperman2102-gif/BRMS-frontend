import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();
const mockPut = vi.fn();

vi.mock('@/api/apiClient', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    put: (...args: unknown[]) => mockPut(...args),
  },
}));

vi.mock('@/config/env', () => ({
  ENV: {
    ENABLE_LOGGING: true,
  },
}));

import { projectsApi } from './projectsApi';

describe('projectsApi', () => {
  const mockResponse = {
    vertical_key: 'v1',
    vertical_name: 'Vertical One',
    projects: [
      {
        project_key: 'p1',
        name: 'Project Alpha',
        description: 'Alpha description',
        domain: 'banking',
      },
      {
        project_key: 'p2',
        name: 'Project Beta',
        description: 'Beta description',
        domain: 'finance',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-23T10:00:00.000Z'));
    projectsApi.invalidateProjectsCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches vertical projects from api and caches the response', async () => {
    mockGet.mockResolvedValue({ data: mockResponse });

    const result = await projectsApi.getVerticalProjects('v1');

    expect(mockGet).toHaveBeenCalledWith(
      '/api/v1/verticals/v1/projects?status=ACTIVE',
    );
    expect(result).toEqual(mockResponse);
  });

  it('returns cached data when called again within ttl', async () => {
    mockGet.mockResolvedValue({ data: mockResponse });

    const first = await projectsApi.getVerticalProjects('v1');
    const second = await projectsApi.getVerticalProjects('v1');

    expect(first).toEqual(mockResponse);
    expect(second).toEqual(mockResponse);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('refetches data when cache ttl has expired', async () => {
    mockGet.mockResolvedValue({ data: mockResponse });

    await projectsApi.getVerticalProjects('v1');

    vi.advanceTimersByTime(30_001);

    const refreshedResponse = {
      ...mockResponse,
      vertical_name: 'Vertical One Updated',
    };
    mockGet.mockResolvedValueOnce({ data: refreshedResponse });

    const result = await projectsApi.getVerticalProjects('v1');

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(result).toEqual(refreshedResponse);
  });

  it('reuses the same inflight request for repeated calls before resolution', async () => {
  let resolvePromise!: (value: { data: typeof mockResponse }) => void;

  const pendingPromise = new Promise<{ data: typeof mockResponse }>((resolve) => {
    resolvePromise = resolve;
  });

  mockGet.mockReturnValue(pendingPromise);

  const promise1 = projectsApi.getVerticalProjects('v1');
  const promise2 = projectsApi.getVerticalProjects('v1');

  expect(mockGet).toHaveBeenCalledTimes(1);

  resolvePromise({ data: mockResponse });

  const [result1, result2] = await Promise.all([promise1, promise2]);

  expect(result1).toEqual(mockResponse);
  expect(result2).toEqual(mockResponse);
});

  it('clears inflight cache when request fails and allows retry', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'));

    await expect(projectsApi.getVerticalProjects('v1')).rejects.toThrow('Network error');

    mockGet.mockResolvedValueOnce({ data: mockResponse });

    const result = await projectsApi.getVerticalProjects('v1');

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockResponse);
  });

  it('returns only projects from getProjectsView', async () => {
    mockGet.mockResolvedValue({ data: mockResponse });

    const result = await projectsApi.getProjectsView('v1');

    expect(result).toEqual(mockResponse.projects);
  });

  it('invalidates cache for a specific vertical key', async () => {
    mockGet.mockResolvedValue({ data: mockResponse });

    await projectsApi.getVerticalProjects('v1');
    projectsApi.invalidateProjectsCache('v1');
    await projectsApi.getVerticalProjects('v1');

    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('invalidates all cache entries when no key is passed', async () => {
    mockGet
      .mockResolvedValueOnce({ data: mockResponse })
      .mockResolvedValueOnce({
        data: { ...mockResponse, vertical_key: 'v2', vertical_name: 'Vertical Two' },
      });

    await projectsApi.getVerticalProjects('v1');
    await projectsApi.getVerticalProjects('v2');

    projectsApi.invalidateProjectsCache();

    mockGet
      .mockResolvedValueOnce({ data: mockResponse })
      .mockResolvedValueOnce({
        data: { ...mockResponse, vertical_key: 'v2', vertical_name: 'Vertical Two' },
      });

    await projectsApi.getVerticalProjects('v1');
    await projectsApi.getVerticalProjects('v2');

    expect(mockGet).toHaveBeenCalledTimes(4);
  });

  it('creates a project and invalidates cache for that vertical', async () => {
    const payload = {
      name: 'Project Gamma',
      description: 'Gamma description',
      vertical_key: 'v1',
      domain: 'insurance',
    };

    const responseData = { success: true, project_key: 'p3' };
    const invalidateSpy = vi.spyOn(projectsApi, 'invalidateProjectsCache');

    mockPost.mockResolvedValue({ data: responseData });

    const result = await projectsApi.createProject(payload);

    expect(mockPost).toHaveBeenCalledWith('/api/v1/projects/', payload);
    expect(invalidateSpy).toHaveBeenCalledWith('v1');
    expect(result).toEqual(responseData);
  });

  it('deletes a project and invalidates all project cache', async () => {
    const responseData = { success: true };
    const invalidateSpy = vi.spyOn(projectsApi, 'invalidateProjectsCache');

    mockDelete.mockResolvedValue({ data: responseData });

    const result = await projectsApi.deleteProject('p1', 'admin@example.com');

    expect(mockDelete).toHaveBeenCalledWith(
      '/api/v1/projects/p1?deleted_by=admin@example.com',
    );
    expect(invalidateSpy).toHaveBeenCalledWith();
    expect(result).toEqual(responseData);
  });

  it('updates a project and invalidates all cache', async () => {
    const payload = {
      name: 'Project Alpha Updated',
      description: 'Updated description',
      domain: 'retail',
    };

    const responseData = { success: true };
    const invalidateSpy = vi.spyOn(projectsApi, 'invalidateProjectsCache');

    mockPut.mockResolvedValue({ data: responseData });

    const result = await projectsApi.updateProject('p1', payload);

    expect(mockPut).toHaveBeenCalledWith(
      '/api/v1/projects/p1',
      {
        ...payload,
        updated_by: 'admin',
      },
    );
    expect(invalidateSpy).toHaveBeenCalledWith();
    expect(result).toEqual(responseData);
  });

  it('returns true when project name already exists ignoring case and spaces', async () => {
    mockGet.mockResolvedValue({ data: mockResponse });

    const result = await projectsApi.checkProjectNameExists('  project alpha  ', 'v1');

    expect(result).toBe(true);
  });

  it('returns false when project name does not exist', async () => {
    mockGet.mockResolvedValue({ data: mockResponse });

    const result = await projectsApi.checkProjectNameExists('Project Zeta', 'v1');

    expect(result).toBe(false);
  });

  it('logs error and rethrows when checkProjectNameExists fails and logging is enabled', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Failed to load projects');

    mockGet.mockRejectedValue(error);

    await expect(
      projectsApi.checkProjectNameExists('Project Alpha', 'v1'),
    ).rejects.toThrow('Failed to load projects');

    expect(errorSpy).toHaveBeenCalledWith('Error checking project name:', error);

    errorSpy.mockRestore();
  });

});