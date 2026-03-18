import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type {
  DeployRulePayload,
  DeployRuleResponse,
  DeployStats,
  DeploySummary,
  RawEnvLogFileMeta,
  RawEnvLogFileResponse,
  RawEnvLogListResponse,
} from '@/modules/deploy/types/deployEndpointsTypes';
import type { Rule } from '@/modules/deploy/types/deployTypes';

vi.mock('@/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import axiosInstance from '@/api/apiClient';
import { deployApi } from './deployApi';

const mockedGet    = vi.mocked(axiosInstance.get);
const mockedPost   = vi.mocked(axiosInstance.post);
const mockedPut    = vi.mocked(axiosInstance.put);
const mockedDelete = vi.mocked(axiosInstance.delete);

const SUMMARY: DeploySummary = {
  total_active_projects: 3,
  active_projects: [
    { project_key: 'proj-1', project_name: 'Project One' },
    { project_key: 'proj-2', project_name: 'Project Two' },
  ],
  total_active_rules: 10,
};

const STATS: DeployStats = {
  project_key: 'proj-1',
  total_rule_versions: 20,
  pending_versions: 3,
  approved_versions: 5,
  rejected_versions: 1,
  deployed_versions: 8,
  approved_not_deployed_versions: 2,
  monthly_deployments: [{ year: 2024, month: 1, total: 4 }],
  undeployed_approved_versions: [],
  deployed_rules: [],
};

const RULES: Rule[] = [
  { rule_key: 'r1', version: 'v1', environment: 'dev', rule_name: 'Rule One' } as unknown as Rule,
  { rule_key: 'r2', version: 'v2', environment: 'prod', rule_name: 'Rule Two' } as unknown as Rule,
];

const DEPLOY_PAYLOAD: DeployRulePayload = {
  rule_key: 'r1',
  version: 'v1',
  environment: 'dev',
  activated_by: 'super_admin',
};

const DEPLOY_RESPONSE: DeployRuleResponse = { success: true };

const LOG_FILES: RawEnvLogFileMeta[] = [
  { file_key: 'file-1', created_at: '2024-01-15T10:00:00Z' },
  { file_key: 'file-2', created_at: '2024-01-15T11:00:00Z' },
];

const LOG_FILE_RESPONSE: RawEnvLogFileResponse = {
  file_key: 'file-1',
  data: ['line 1', 'line 2', 'line 3'],
  total: 3,
  count: 3,
  skip: 0,
  limit: 10,
};

const FIXED_DATE = new Date('2024-01-15T12:00:00.000Z');

describe('deployApi', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getDashboardSummary', () => {
    it('calls axiosInstance.post with the correct endpoint', async () => {
      mockedPost.mockResolvedValue({ data: SUMMARY });
      await deployApi.getDashboardSummary('finance');
      expect(mockedPost).toHaveBeenCalledWith(
        '/api/v1/env/dashboard/summary',
        { vertical_key: 'finance' }
      );
    });

    it('passes vertical_key in the request body', async () => {
      mockedPost.mockResolvedValue({ data: SUMMARY });
      await deployApi.getDashboardSummary('health');
      expect(mockedPost).toHaveBeenCalledWith(
        '/api/v1/env/dashboard/summary',
        { vertical_key: 'health' }
      );
    });

    it('returns response.data', async () => {
      mockedPost.mockResolvedValue({ data: SUMMARY });
      const result = await deployApi.getDashboardSummary('finance');
      expect(result).toEqual(SUMMARY);
    });

    it('calls post exactly once', async () => {
      mockedPost.mockResolvedValue({ data: SUMMARY });
      await deployApi.getDashboardSummary('finance');
      expect(mockedPost).toHaveBeenCalledTimes(1);
    });

    it('propagates errors from axiosInstance.post', async () => {
      mockedPost.mockRejectedValue(new Error('Network Error'));
      await expect(deployApi.getDashboardSummary('finance')).rejects.toThrow('Network Error');
    });
  });

  describe('getDashboardStats', () => {
    it('calls axiosInstance.post with the correct endpoint', async () => {
      mockedPost.mockResolvedValue({ data: STATS });
      await deployApi.getDashboardStats('proj-1', 'dev');
      expect(mockedPost).toHaveBeenCalledWith(
        '/api/v1/env/dashboard/stats',
        { project_key: 'proj-1', env: 'dev' }
      );
    });

    it('passes project_key and env in the request body', async () => {
      mockedPost.mockResolvedValue({ data: STATS });
      await deployApi.getDashboardStats('proj-2', 'prod');
      expect(mockedPost).toHaveBeenCalledWith(
        '/api/v1/env/dashboard/stats',
        { project_key: 'proj-2', env: 'prod' }
      );
    });

    it('returns response.data', async () => {
      mockedPost.mockResolvedValue({ data: STATS });
      const result = await deployApi.getDashboardStats('proj-1', 'dev');
      expect(result).toEqual(STATS);
    });

    it('propagates errors', async () => {
      mockedPost.mockRejectedValue(new Error('500'));
      await expect(deployApi.getDashboardStats('proj-1', 'dev')).rejects.toThrow('500');
    });
  });

  describe('getDeploymentRules', () => {
    it('calls axiosInstance.post with the correct endpoint and body', async () => {
      mockedPost.mockResolvedValue({ data: { rules: RULES } });
      await deployApi.getDeploymentRules('proj-1', 'dev');
      expect(mockedPost).toHaveBeenCalledWith(
        '/api/v1/bindings/',
        { project_key: 'proj-1', env: 'dev' }
      );
    });

    it('returns rules when response has rules field', async () => {
      mockedPost.mockResolvedValue({ data: { rules: RULES } });
      const result = await deployApi.getDeploymentRules('proj-1', 'dev');
      expect(result).toEqual(RULES);
    });

    it('returns undeployed_approved_versions when rules field is absent', async () => {
      mockedPost.mockResolvedValue({ data: { undeployed_approved_versions: RULES } });
      const result = await deployApi.getDeploymentRules('proj-1', 'dev');
      expect(result).toEqual(RULES);
    });

    it('returns empty array when both rules and undeployed_approved_versions are absent', async () => {
      mockedPost.mockResolvedValue({ data: {} });
      const result = await deployApi.getDeploymentRules('proj-1', 'dev');
      expect(result).toEqual([]);
    });

    it('returns empty array when rules is undefined and undeployed_approved_versions is undefined', async () => {
      mockedPost.mockResolvedValue({ data: { rules: undefined, undeployed_approved_versions: undefined } });
      const result = await deployApi.getDeploymentRules('proj-1', 'dev');
      expect(result).toEqual([]);
    });

    it('prefers rules over undeployed_approved_versions when both are present', async () => {
      const fallback: Rule[] = [{ rule_key: 'fallback', rule_name: 'Fallback' } as unknown as Rule];
      mockedPost.mockResolvedValue({ data: { rules: RULES, undeployed_approved_versions: fallback } });
      const result = await deployApi.getDeploymentRules('proj-1', 'dev');
      expect(result).toEqual(RULES);
    });

    it('propagates errors', async () => {
      mockedPost.mockRejectedValue(new Error('Network Error'));
      await expect(deployApi.getDeploymentRules('proj-1', 'dev')).rejects.toThrow('Network Error');
    });
  });

  describe('deployRule', () => {
    it('calls axiosInstance.post with the correct endpoint and payload', async () => {
      mockedPost.mockResolvedValue({ data: DEPLOY_RESPONSE });
      await deployApi.deployRule(DEPLOY_PAYLOAD);
      expect(mockedPost).toHaveBeenCalledWith('/api/v1/bindings', DEPLOY_PAYLOAD);
    });

    it('returns response.data', async () => {
      mockedPost.mockResolvedValue({ data: DEPLOY_RESPONSE });
      const result = await deployApi.deployRule(DEPLOY_PAYLOAD);
      expect(result).toEqual(DEPLOY_RESPONSE);
    });

    it('calls post exactly once', async () => {
      mockedPost.mockResolvedValue({ data: DEPLOY_RESPONSE });
      await deployApi.deployRule(DEPLOY_PAYLOAD);
      expect(mockedPost).toHaveBeenCalledTimes(1);
    });

    it('propagates errors', async () => {
      mockedPost.mockRejectedValue(new Error('Deploy failed'));
      await expect(deployApi.deployRule(DEPLOY_PAYLOAD)).rejects.toThrow('Deploy failed');
    });
  });

  describe('revokeRule', () => {
    it('calls axiosInstance.delete with the correct URL', async () => {
      mockedDelete.mockResolvedValue({});
      await deployApi.revokeRule('rule-1', 'v1', 'dev');
      expect(mockedDelete).toHaveBeenCalledWith('/api/v1/bindings/rule-1/v1/dev');
    });

    it('interpolates rule_key, version, and environment into the URL', async () => {
      mockedDelete.mockResolvedValue({});
      await deployApi.revokeRule('my-rule', '2.0', 'prod');
      expect(mockedDelete).toHaveBeenCalledWith('/api/v1/bindings/my-rule/2.0/prod');
    });

    it('returns void (undefined)', async () => {
      mockedDelete.mockResolvedValue({});
      const result = await deployApi.revokeRule('rule-1', 'v1', 'dev');
      expect(result).toBeUndefined();
    });

    it('calls delete exactly once', async () => {
      mockedDelete.mockResolvedValue({});
      await deployApi.revokeRule('rule-1', 'v1', 'dev');
      expect(mockedDelete).toHaveBeenCalledTimes(1);
    });

    it('propagates errors', async () => {
      mockedDelete.mockRejectedValue(new Error('Revoke failed'));
      await expect(deployApi.revokeRule('rule-1', 'v1', 'dev')).rejects.toThrow('Revoke failed');
    });
  });

  describe('promoteRule', () => {
    it('calls axiosInstance.put with the correct URL', async () => {
      mockedPut.mockResolvedValue({});
      await deployApi.promoteRule('rule-1', 'prod', 'dev');
      expect(mockedPut).toHaveBeenCalledWith(
        '/api/v1/bindings/rule-1/dev',
        { SetEnvironment: 'prod', activated_by: 'super_admin' }
      );
    });

    it('uses current_env in the URL path', async () => {
      mockedPut.mockResolvedValue({});
      await deployApi.promoteRule('rule-x', 'staging', 'dev');
      expect(mockedPut).toHaveBeenCalledWith(
        '/api/v1/bindings/rule-x/dev',
        expect.objectContaining({ SetEnvironment: 'staging' })
      );
    });

    it('sends target_env as SetEnvironment in the body', async () => {
      mockedPut.mockResolvedValue({});
      await deployApi.promoteRule('rule-1', 'prod', 'dev');
      expect(mockedPut).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ SetEnvironment: 'prod' })
      );
    });

    it('always sends activated_by: "super_admin"', async () => {
      mockedPut.mockResolvedValue({});
      await deployApi.promoteRule('rule-1', 'prod', 'dev');
      expect(mockedPut).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ activated_by: 'super_admin' })
      );
    });

    it('returns void (undefined)', async () => {
      mockedPut.mockResolvedValue({});
      const result = await deployApi.promoteRule('rule-1', 'prod', 'dev');
      expect(result).toBeUndefined();
    });

    it('propagates errors', async () => {
      mockedPut.mockRejectedValue(new Error('Promote failed'));
      await expect(deployApi.promoteRule('rule-1', 'prod', 'dev')).rejects.toThrow('Promote failed');
    });
  });

  describe('formatLocalDateYYYYMMDD (via getEnvironmentLogFiles)', () => {
    afterEach(() => vi.useRealTimers());

    it('formats the date as YYYY-MM-DD and uses it in the URL', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-05T09:00:00'));
      mockedGet.mockResolvedValue({ data: [] });

      await deployApi.getEnvironmentLogFiles('dev');

      expect(mockedGet).toHaveBeenCalledWith('/api/v1/env-logs/dev/date/2024-03-05');
      vi.useRealTimers();
    });

    it('zero-pads single-digit months', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-07T00:00:00'));
      mockedGet.mockResolvedValue({ data: [] });

      await deployApi.getEnvironmentLogFiles('dev');

      expect(mockedGet).toHaveBeenCalledWith('/api/v1/env-logs/dev/date/2024-01-07');
      vi.useRealTimers();
    });

    it('zero-pads single-digit days', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-12-03T00:00:00'));
      mockedGet.mockResolvedValue({ data: [] });

      await deployApi.getEnvironmentLogFiles('dev');

      expect(mockedGet).toHaveBeenCalledWith('/api/v1/env-logs/dev/date/2024-12-03');
      vi.useRealTimers();
    });
  });

  describe('getEnvironmentLogFiles', () => {
    it('uses the provided date in the URL', async () => {
      mockedGet.mockResolvedValue({ data: LOG_FILES });
      await deployApi.getEnvironmentLogFiles('dev', '2024-01-15');
      expect(mockedGet).toHaveBeenCalledWith('/api/v1/env-logs/dev/date/2024-01-15');
    });

    it('uses today\'s date when no date is provided', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);
      mockedGet.mockResolvedValue({ data: [] });

      await deployApi.getEnvironmentLogFiles('prod');

      expect(mockedGet).toHaveBeenCalledWith(
        expect.stringMatching(/^\/api\/v1\/env-logs\/prod\/date\/\d{4}-\d{2}-\d{2}$/)
      );
      vi.useRealTimers();
    });

    it('returns array directly when response.data is already an array', async () => {
      mockedGet.mockResolvedValue({ data: LOG_FILES });
      const result = await deployApi.getEnvironmentLogFiles('dev', '2024-01-15');
      expect(result).toEqual(LOG_FILES);
    });

    it('returns payload.data when response is RawEnvLogListResponse with data field', async () => {
      const listResponse: RawEnvLogListResponse = { data: LOG_FILES } as RawEnvLogListResponse;
      mockedGet.mockResolvedValue({ data: listResponse });
      const result = await deployApi.getEnvironmentLogFiles('dev', '2024-01-15');
      expect(result).toEqual(LOG_FILES);
    });

    it('returns payload.logs when response is RawEnvLogListResponse with logs field', async () => {
      const listResponse = { logs: LOG_FILES } as unknown as RawEnvLogListResponse;
      mockedGet.mockResolvedValue({ data: listResponse });
      const result = await deployApi.getEnvironmentLogFiles('dev', '2024-01-15');
      expect(result).toEqual(LOG_FILES);
    });

    it('returns empty array when RawEnvLogListResponse has neither data nor logs', async () => {
      mockedGet.mockResolvedValue({ data: {} });
      const result = await deployApi.getEnvironmentLogFiles('dev', '2024-01-15');
      expect(result).toEqual([]);
    });

    it('returns empty array when response.data is an empty array', async () => {
      mockedGet.mockResolvedValue({ data: [] });
      const result = await deployApi.getEnvironmentLogFiles('dev', '2024-01-15');
      expect(result).toEqual([]);
    });

    it('propagates errors', async () => {
      mockedGet.mockRejectedValue(new Error('Log fetch failed'));
      await expect(
        deployApi.getEnvironmentLogFiles('dev', '2024-01-15')
      ).rejects.toThrow('Log fetch failed');
    });
  });

  describe('getEnvironmentLogPage', () => {
    it('calls axiosInstance.get with the correct URL and default params', async () => {
      mockedGet.mockResolvedValue({ data: LOG_FILE_RESPONSE });
      await deployApi.getEnvironmentLogPage('dev', 'file-1');
      expect(mockedGet).toHaveBeenCalledWith(
        '/api/v1/env-logs/dev/file/file-1',
        { params: { skip: 0, limit: 10 } }
      );
    });

    it('passes custom skip value in params', async () => {
      mockedGet.mockResolvedValue({ data: LOG_FILE_RESPONSE });
      await deployApi.getEnvironmentLogPage('dev', 'file-1', 20);
      expect(mockedGet).toHaveBeenCalledWith(
        '/api/v1/env-logs/dev/file/file-1',
        { params: { skip: 20, limit: 10 } }
      );
    });

    it('returns shaped response with all fields from payload', async () => {
      mockedGet.mockResolvedValue({ data: LOG_FILE_RESPONSE });
      const result = await deployApi.getEnvironmentLogPage('dev', 'file-1');
      expect(result).toEqual({
        file_key: 'file-1',
        environment: 'dev',
        data: ['line 1', 'line 2', 'line 3'],
        total: 3,
        count: 3,
        skip: 0,
        limit: 10,
      });
    });

    it('uses fileKey as fallback when payload.file_key is missing', async () => {
      const noFileKey = { ...LOG_FILE_RESPONSE, file_key: undefined } as unknown as RawEnvLogFileResponse;
      mockedGet.mockResolvedValue({ data: noFileKey });
      const result = await deployApi.getEnvironmentLogPage('dev', 'fallback-key');
      expect(result.file_key).toBe('fallback-key');
    });

    it('uses payload.logs when payload.data is missing', async () => {
      const logsPayload = {
        ...LOG_FILE_RESPONSE,
        data: undefined,
        logs: ['log line 1'],
      } as unknown as RawEnvLogFileResponse;
      mockedGet.mockResolvedValue({ data: logsPayload });
      const result = await deployApi.getEnvironmentLogPage('dev', 'file-1');
      expect(result.data).toEqual(['log line 1']);
    });

    it('returns empty data array when both payload.data and payload.logs are missing', async () => {
      const emptyPayload = {
        file_key: 'file-1',
        data: undefined,
        logs: undefined,
        total: 0,
        count: 0,
        skip: 0,
        limit: 10,
      } as unknown as RawEnvLogFileResponse;
      mockedGet.mockResolvedValue({ data: emptyPayload });
      const result = await deployApi.getEnvironmentLogPage('dev', 'file-1');
      expect(result.data).toEqual([]);
    });

    it('uses 0 as fallback for total when payload.total is missing', async () => {
      const noTotal = { ...LOG_FILE_RESPONSE, total: undefined } as unknown as RawEnvLogFileResponse;
      mockedGet.mockResolvedValue({ data: noTotal });
      const result = await deployApi.getEnvironmentLogPage('dev', 'file-1');
      expect(result.total).toBe(0);
    });

    it('uses lines.length as fallback for count when payload.count is missing', async () => {
      const noCount = { ...LOG_FILE_RESPONSE, count: undefined } as unknown as RawEnvLogFileResponse;
      mockedGet.mockResolvedValue({ data: noCount });
      const result = await deployApi.getEnvironmentLogPage('dev', 'file-1');
      expect(result.count).toBe(3); 
    });

    it('uses skip argument as fallback when payload.skip is missing', async () => {
      const noSkip = { ...LOG_FILE_RESPONSE, skip: undefined } as unknown as RawEnvLogFileResponse;
      mockedGet.mockResolvedValue({ data: noSkip });
      const result = await deployApi.getEnvironmentLogPage('dev', 'file-1', 30);
      expect(result.skip).toBe(30);
    });

    it('uses ENV_LOGS_PAGE_SIZE (10) as fallback when payload.limit is missing', async () => {
      const noLimit = { ...LOG_FILE_RESPONSE, limit: undefined } as unknown as RawEnvLogFileResponse;
      mockedGet.mockResolvedValue({ data: noLimit });
      const result = await deployApi.getEnvironmentLogPage('dev', 'file-1');
      expect(result.limit).toBe(10);
    });

    it('returns empty data array when lines is not an array', async () => {
      const nonArrayData = {
        ...LOG_FILE_RESPONSE,
        data: 'not-an-array' as unknown as string[],
      };
      mockedGet.mockResolvedValue({ data: nonArrayData });
      const result = await deployApi.getEnvironmentLogPage('dev', 'file-1');
      expect(result.data).toEqual([]);
    });

    it('propagates errors', async () => {
      mockedGet.mockRejectedValue(new Error('Page fetch failed'));
      await expect(
        deployApi.getEnvironmentLogPage('dev', 'file-1')
      ).rejects.toThrow('Page fetch failed');
    });
  });

  describe('getEnvironmentLogs', () => {
    afterEach(() => vi.useRealTimers());

    it('returns empty array when no log files are found', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);
      mockedGet.mockResolvedValue({ data: [] });

      const result = await deployApi.getEnvironmentLogs('dev');

      expect(result).toEqual([]);
    });

    it('calls getEnvironmentLogFiles with today\'s date', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);
      mockedGet.mockResolvedValue({ data: [] });

      await deployApi.getEnvironmentLogs('dev');

      expect(mockedGet).toHaveBeenCalledWith(
        expect.stringMatching(/^\/api\/v1\/env-logs\/dev\/date\/\d{4}-\d{2}-\d{2}$/)
      );
    });

    it('fetches a log page for each file', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);

      mockedGet
        .mockResolvedValueOnce({ data: LOG_FILES })
        .mockResolvedValue({ data: LOG_FILE_RESPONSE });

      await deployApi.getEnvironmentLogs('dev');

      expect(mockedGet).toHaveBeenCalledTimes(1 + LOG_FILES.length);
    });

    it('returns one EnvironmentLog entry per file', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);

      mockedGet
        .mockResolvedValueOnce({ data: LOG_FILES })
        .mockResolvedValue({ data: LOG_FILE_RESPONSE });

      const result = await deployApi.getEnvironmentLogs('dev');

      expect(result).toHaveLength(LOG_FILES.length);
    });

    it('maps file_key to id and file_key fields', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);

      mockedGet
        .mockResolvedValueOnce({ data: [LOG_FILES[0]] })
        .mockResolvedValueOnce({ data: LOG_FILE_RESPONSE });

      const result = await deployApi.getEnvironmentLogs('dev');

      expect(result[0].id).toBe('file-1');
      expect(result[0].file_key).toBe('file-1');
    });

    it('joins log lines with newline into content', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);

      mockedGet
        .mockResolvedValueOnce({ data: [LOG_FILES[0]] })
        .mockResolvedValueOnce({ data: LOG_FILE_RESPONSE });

      const result = await deployApi.getEnvironmentLogs('dev');

      expect(result[0].content).toBe('line 1\nline 2\nline 3');
    });

    it('uses file.created_at as created_at field', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);

      mockedGet
        .mockResolvedValueOnce({ data: [LOG_FILES[0]] })
        .mockResolvedValueOnce({ data: LOG_FILE_RESPONSE });

      const result = await deployApi.getEnvironmentLogs('dev');

      expect(result[0].created_at).toBe('2024-01-15T10:00:00Z');
    });

    it('falls back to current ISO string when file.created_at is missing', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);

      const fileNoDate = { file_key: 'file-x' } as RawEnvLogFileMeta;
      mockedGet
        .mockResolvedValueOnce({ data: [fileNoDate] })
        .mockResolvedValueOnce({ data: LOG_FILE_RESPONSE });

      const result = await deployApi.getEnvironmentLogs('dev');

      expect(result[0].created_at).toBe(FIXED_DATE.toISOString());
    });

    it('sets environment field on each entry', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);

      mockedGet
        .mockResolvedValueOnce({ data: [LOG_FILES[0]] })
        .mockResolvedValueOnce({ data: LOG_FILE_RESPONSE });

      const result = await deployApi.getEnvironmentLogs('prod');

      expect(result[0].environment).toBe('prod');
    });

    it('processes multiple files in parallel and returns all entries', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);

      const pageForFile2: RawEnvLogFileResponse = {
        ...LOG_FILE_RESPONSE,
        file_key: 'file-2',
        data: ['only line'],
      };

      mockedGet
        .mockResolvedValueOnce({ data: LOG_FILES })
        .mockResolvedValueOnce({ data: LOG_FILE_RESPONSE })
        .mockResolvedValueOnce({ data: pageForFile2 });

      const result = await deployApi.getEnvironmentLogs('dev');

      expect(result).toHaveLength(2);
      expect(result[0].file_key).toBe('file-1');
      expect(result[1].file_key).toBe('file-2');
    });

    it('propagates errors from getEnvironmentLogFiles', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);
      mockedGet.mockRejectedValue(new Error('Files fetch failed'));

      await expect(deployApi.getEnvironmentLogs('dev')).rejects.toThrow('Files fetch failed');
    });

    it('propagates errors from getEnvironmentLogPage', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);

      mockedGet
        .mockResolvedValueOnce({ data: [LOG_FILES[0]] })
        .mockRejectedValueOnce(new Error('Page fetch failed'));

      await expect(deployApi.getEnvironmentLogs('dev')).rejects.toThrow('Page fetch failed');
    });
  });

  describe('resolveEnvLogFiles (via getEnvironmentLogFiles)', () => {
    it('returns payload directly when it is an array', async () => {
      mockedGet.mockResolvedValue({ data: LOG_FILES });
      const result = await deployApi.getEnvironmentLogFiles('dev', '2024-01-15');
      expect(result).toEqual(LOG_FILES);
    });

    it('returns payload.data when payload is an object with data field', async () => {
      mockedGet.mockResolvedValue({ data: { data: LOG_FILES } });
      const result = await deployApi.getEnvironmentLogFiles('dev', '2024-01-15');
      expect(result).toEqual(LOG_FILES);
    });

    it('returns payload.logs when payload is an object with logs field but no data field', async () => {
      mockedGet.mockResolvedValue({ data: { logs: LOG_FILES } });
      const result = await deployApi.getEnvironmentLogFiles('dev', '2024-01-15');
      expect(result).toEqual(LOG_FILES);
    });

    it('returns empty array when payload is an object with neither data nor logs', async () => {
      mockedGet.mockResolvedValue({ data: {} });
      const result = await deployApi.getEnvironmentLogFiles('dev', '2024-01-15');
      expect(result).toEqual([]);
    });
  });
});