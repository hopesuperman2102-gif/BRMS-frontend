import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '@/api/apiClient';
import { rulesTableApi } from '@/modules/hub/api/entireRuleApi';

vi.mock('@/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('rulesTableApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rulesTableApi.invalidateCache();
  });

  it('fetches vertical rules and stores them in cache', async () => {
    const mockResponse = {
      data: {
        vertical_key: 'v1',
        projects: [],
      },
    };

    vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

    const result = await rulesTableApi.getVerticalRules('v1');

    expect(axiosInstance.get).toHaveBeenCalledWith('/api/v1/verticals/v1/rules');
    expect(result).toEqual(mockResponse.data);
  });

  it('returns cached vertical rules without calling api again', async () => {
    const mockResponse = {
      data: {
        vertical_key: 'v1',
        projects: [{ project_key: 'p1', project_name: 'Project 1', rules: [] }],
      },
    };

    vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

    const firstResult = await rulesTableApi.getVerticalRules('v1');
    const secondResult = await rulesTableApi.getVerticalRules('v1');

    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(firstResult).toEqual(mockResponse.data);
    expect(secondResult).toEqual(mockResponse.data);
  });

  it('fetches separately for different vertical keys', async () => {
    vi.mocked(axiosInstance.get)
      .mockResolvedValueOnce({
        data: { vertical_key: 'v1', projects: [] },
      })
      .mockResolvedValueOnce({
        data: { vertical_key: 'v2', projects: [] },
      });

    const result1 = await rulesTableApi.getVerticalRules('v1');
    const result2 = await rulesTableApi.getVerticalRules('v2');

    expect(axiosInstance.get).toHaveBeenCalledTimes(2);
    expect(axiosInstance.get).toHaveBeenNthCalledWith(1, '/api/v1/verticals/v1/rules');
    expect(axiosInstance.get).toHaveBeenNthCalledWith(2, '/api/v1/verticals/v2/rules');
    expect(result1).toEqual({ vertical_key: 'v1', projects: [] });
    expect(result2).toEqual({ vertical_key: 'v2', projects: [] });
  });

  it('refreshVerticalRules clears cache for that vertical and fetches fresh data', async () => {
    vi.mocked(axiosInstance.get)
      .mockResolvedValueOnce({
        data: { vertical_key: 'v1', projects: [{ project_key: 'p1', rules: [] }] },
      })
      .mockResolvedValueOnce({
        data: { vertical_key: 'v1', projects: [{ project_key: 'p2', rules: [] }] },
      });

    const firstResult = await rulesTableApi.getVerticalRules('v1');
    const refreshedResult = await rulesTableApi.refreshVerticalRules('v1');

    expect(axiosInstance.get).toHaveBeenCalledTimes(2);
    expect(firstResult).toEqual({
      vertical_key: 'v1',
      projects: [{ project_key: 'p1', rules: [] }],
    });
    expect(refreshedResult).toEqual({
      vertical_key: 'v1',
      projects: [{ project_key: 'p2', rules: [] }],
    });
  });

  it('reviewRuleVersion sends patch request and clears cache', async () => {
    const cachedData = {
      vertical_key: 'v1',
      projects: [{ project_key: 'p1', rules: [] }],
    };

    vi.mocked(axiosInstance.get)
      .mockResolvedValueOnce({ data: cachedData })
      .mockResolvedValueOnce({
        data: { vertical_key: 'v1', projects: [{ project_key: 'p2', rules: [] }] },
      });

    vi.mocked(axiosInstance.patch).mockResolvedValue({
      data: {
        success: true,
        message: 'Rule reviewed successfully',
      },
    });

    await rulesTableApi.getVerticalRules('v1');

    const result = await rulesTableApi.reviewRuleVersion(
      'rule-1',
      '1.0',
      'APPROVED',
      'tester@example.com',
    );

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      '/api/v1/rules/rule-1/versions/1.0/review',
      {
        action: 'APPROVED',
        reviewed_by: 'tester@example.com',
      },
    );

    expect(result).toEqual({
      success: true,
      message: 'Rule reviewed successfully',
    });

    await rulesTableApi.getVerticalRules('v1');

    expect(axiosInstance.get).toHaveBeenCalledTimes(2);
  });

  it('reviewRuleVersion works for REJECTED action too', async () => {
    vi.mocked(axiosInstance.patch).mockResolvedValue({
      data: {
        success: true,
        message: 'Rule rejected successfully',
      },
    });

    const result = await rulesTableApi.reviewRuleVersion(
      'rule-2',
      '2.1',
      'REJECTED',
      'reviewer@example.com',
    );

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      '/api/v1/rules/rule-2/versions/2.1/review',
      {
        action: 'REJECTED',
        reviewed_by: 'reviewer@example.com',
      },
    );

    expect(result).toEqual({
      success: true,
      message: 'Rule rejected successfully',
    });
  });

  it('invalidateCache removes only the provided vertical key', async () => {
    vi.mocked(axiosInstance.get)
      .mockResolvedValueOnce({
        data: { vertical_key: 'v1', projects: [] },
      })
      .mockResolvedValueOnce({
        data: { vertical_key: 'v2', projects: [] },
      })
      .mockResolvedValueOnce({
        data: { vertical_key: 'v1', projects: [{ project_key: 'fresh', rules: [] }] },
      });

    await rulesTableApi.getVerticalRules('v1');
    await rulesTableApi.getVerticalRules('v2');

    rulesTableApi.invalidateCache('v1');

    await rulesTableApi.getVerticalRules('v1');
    await rulesTableApi.getVerticalRules('v2');

    expect(axiosInstance.get).toHaveBeenCalledTimes(3);
  });

  it('invalidateCache without key clears entire cache', async () => {
    vi.mocked(axiosInstance.get)
      .mockResolvedValueOnce({
        data: { vertical_key: 'v1', projects: [] },
      })
      .mockResolvedValueOnce({
        data: { vertical_key: 'v2', projects: [] },
      })
      .mockResolvedValueOnce({
        data: { vertical_key: 'v1', projects: [] },
      })
      .mockResolvedValueOnce({
        data: { vertical_key: 'v2', projects: [] },
      });

    await rulesTableApi.getVerticalRules('v1');
    await rulesTableApi.getVerticalRules('v2');

    rulesTableApi.invalidateCache();

    await rulesTableApi.getVerticalRules('v1');
    await rulesTableApi.getVerticalRules('v2');

    expect(axiosInstance.get).toHaveBeenCalledTimes(4);
  });

  it('throws when getVerticalRules api call fails', async () => {
    const error = new Error('Fetch failed');
    vi.mocked(axiosInstance.get).mockRejectedValue(error);

    await expect(rulesTableApi.getVerticalRules('v1')).rejects.toThrow('Fetch failed');

    expect(axiosInstance.get).toHaveBeenCalledWith('/api/v1/verticals/v1/rules');
  });

  it('throws when reviewRuleVersion api call fails', async () => {
    const error = new Error('Patch failed');
    vi.mocked(axiosInstance.patch).mockRejectedValue(error);

    await expect(
      rulesTableApi.reviewRuleVersion('rule-1', '1.0', 'APPROVED', 'tester@example.com'),
    ).rejects.toThrow('Patch failed');

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      '/api/v1/rules/rule-1/versions/1.0/review',
      {
        action: 'APPROVED',
        reviewed_by: 'tester@example.com',
      },
    );
  });
});