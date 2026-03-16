import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  VerticalProjectRulesResponse,
  RuleResponse,
} from '@/modules/rules/types/ruleEndpointsTypes';

// ── Mock axiosInstance ────────────────────────────────────────────────────────

vi.mock('@/api/apiClient', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
  },
}));

import axiosInstance from '@/api/apiClient';
import { rulesApi } from './rulesApi';

const mockedGet    = vi.mocked(axiosInstance.get);
const mockedPost   = vi.mocked(axiosInstance.post);
const mockedPut    = vi.mocked(axiosInstance.put);
const mockedDelete = vi.mocked(axiosInstance.delete);

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeRawRule = (overrides: Record<string, unknown> = {}) => ({
  rule_key:    'r1',
  rule_name:   'Rule One',
  description: 'A rule',
  status:      'active',
  created_by:  'alice',
  created_at:  '2024-01-01T00:00:00Z',
  updated_by:  'bob',
  updated_at:  '2024-06-01T00:00:00Z',
  directory:   'finance/rules',
  versions:    [{ version: 'v1' }, { version: 'v3' }, { version: 'v2' }],
  ...overrides,
});

const makeVerticalResponse = (
  rules: ReturnType<typeof makeRawRule>[] = [makeRawRule()],
): { data: VerticalProjectRulesResponse } => ({
  data: {
    vertical_name: 'Finance',
    project_name:  'Finance Project',
    rules,
  } as unknown as VerticalProjectRulesResponse,
});

const makeRuleResponse = (overrides: Partial<RuleResponse> = {}): RuleResponse => ({
  rule_key:    'r1',
  name:        'Rule One',
  description: 'A rule',
  status:      'active',
  directory:   'finance/rules',
  updated_at:  '2024-06-01T00:00:00Z',
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('rulesApi', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── getProjectRules ──────────────────────────────────────────────────────────

  describe('getProjectRules', () => {
    it('calls the correct endpoint with project_key and vertical_key', async () => {
      mockedGet.mockResolvedValue(makeVerticalResponse());
      await rulesApi.getProjectRules('proj-1', 'finance');
      expect(mockedGet).toHaveBeenCalledWith(
        '/api/v1/verticals/finance/projects/proj-1/rules'
      );
    });

    it('returns vertical_name and project_name from the response', async () => {
      mockedGet.mockResolvedValue(makeVerticalResponse());
      const result = await rulesApi.getProjectRules('proj-1', 'finance');
      expect(result.vertical_name).toBe('Finance');
      expect(result.project_name).toBe('Finance Project');
    });

    it('maps raw rule fields onto RuleResponse shape', async () => {
      mockedGet.mockResolvedValue(makeVerticalResponse());
      const result = await rulesApi.getProjectRules('proj-1', 'finance');
      const rule = result.rules[0];
      expect(rule.rule_key).toBe('r1');
      expect(rule.name).toBe('Rule One');
      expect(rule.description).toBe('A rule');
      expect(rule.status).toBe('active');
      expect(rule.directory).toBe('finance/rules');
      expect(rule.project_key).toBe('proj-1');
    });

    it('picks the highest numeric version from versions array', async () => {
      mockedGet.mockResolvedValue(makeVerticalResponse([
        makeRawRule({ versions: [{ version: 'v1' }, { version: 'v3' }, { version: 'v2' }] }),
      ]));
      const result = await rulesApi.getProjectRules('proj-1', 'finance');
      expect(result.rules[0].version).toBe('v3');
    });

    it('returns "Unversioned" when versions array is empty', async () => {
      mockedGet.mockResolvedValue(makeVerticalResponse([makeRawRule({ versions: [] })]));
      const result = await rulesApi.getProjectRules('proj-1', 'finance');
      expect(result.rules[0].version).toBe('Unversioned');
    });

    it('returns "Unversioned" when versions is undefined/null', async () => {
      mockedGet.mockResolvedValue(makeVerticalResponse([makeRawRule({ versions: undefined })]));
      const result = await rulesApi.getProjectRules('proj-1', 'finance');
      expect(result.rules[0].version).toBe('Unversioned');
    });

    it('falls back to empty string for missing rule_name', async () => {
      mockedGet.mockResolvedValue(makeVerticalResponse([makeRawRule({ rule_name: undefined })]));
      const result = await rulesApi.getProjectRules('proj-1', 'finance');
      expect(result.rules[0].name).toBe('');
    });

    it('falls back to empty string for missing description', async () => {
      mockedGet.mockResolvedValue(makeVerticalResponse([makeRawRule({ description: undefined })]));
      const result = await rulesApi.getProjectRules('proj-1', 'finance');
      expect(result.rules[0].description).toBe('');
    });

    it('falls back to "DRAFT" for missing status', async () => {
      mockedGet.mockResolvedValue(makeVerticalResponse([makeRawRule({ status: undefined })]));
      const result = await rulesApi.getProjectRules('proj-1', 'finance');
      expect(result.rules[0].status).toBe('DRAFT');
    });

    it('falls back to empty string for missing vertical_name', async () => {
      mockedGet.mockResolvedValue({
        data: { project_name: 'P', rules: [] },
      });
      const result = await rulesApi.getProjectRules('proj-1', 'finance');
      expect(result.vertical_name).toBe('');
    });

    it('falls back to empty string for missing project_name', async () => {
      mockedGet.mockResolvedValue({
        data: { vertical_name: 'V', rules: [] },
      });
      const result = await rulesApi.getProjectRules('proj-1', 'finance');
      expect(result.project_name).toBe('');
    });

    it('handles a null/missing rules array gracefully', async () => {
      mockedGet.mockResolvedValue({
        data: { vertical_name: 'V', project_name: 'P', rules: null },
      });
      const result = await rulesApi.getProjectRules('proj-1', 'finance');
      expect(result.rules).toEqual([]);
    });

    it('returns an empty rules array when rules is not an array', async () => {
      mockedGet.mockResolvedValue({
        data: { vertical_name: 'V', project_name: 'P', rules: 'bad' },
      });
      const result = await rulesApi.getProjectRules('proj-1', 'finance');
      expect(result.rules).toEqual([]);
    });

    it('propagates errors thrown by axiosInstance', async () => {
      mockedGet.mockRejectedValue(new Error('network error'));
      await expect(rulesApi.getProjectRules('proj-1', 'finance')).rejects.toThrow('network error');
    });
  });

  // ── createRule ───────────────────────────────────────────────────────────────

  describe('createRule', () => {
    const payload = {
      project_key: 'proj-1',
      name:        'New Rule',
      description: 'Desc',
      directory:   'finance/rules',
    };

    it('calls POST on the correct endpoint', async () => {
      mockedPost.mockResolvedValue({ data: makeRuleResponse() });
      await rulesApi.createRule(payload);
      expect(mockedPost).toHaveBeenCalledWith(
        '/api/v1/projects/proj-1/rules',
        payload
      );
    });

    it('returns the created rule from the response', async () => {
      const rule = makeRuleResponse({ name: 'New Rule' });
      mockedPost.mockResolvedValue({ data: rule });
      const result = await rulesApi.createRule(payload);
      expect(result).toEqual(rule);
    });

    it('works without an optional directory field', async () => {
      mockedPost.mockResolvedValue({ data: makeRuleResponse() });
      const { directory: _, ...noDir } = payload;
      void _;
      await rulesApi.createRule(noDir);
      expect(mockedPost).toHaveBeenCalledWith(
        '/api/v1/projects/proj-1/rules',
        noDir
      );
    });

    it('propagates errors', async () => {
      mockedPost.mockRejectedValue(new Error('create failed'));
      await expect(rulesApi.createRule(payload)).rejects.toThrow('create failed');
    });
  });

  // ── getRuleDetails ───────────────────────────────────────────────────────────

  describe('getRuleDetails', () => {
    it('calls GET on the correct endpoint', async () => {
      mockedGet.mockResolvedValue({ data: makeRuleResponse() });
      await rulesApi.getRuleDetails('r1');
      expect(mockedGet).toHaveBeenCalledWith('/api/v1/rules/r1');
    });

    it('returns the rule from the response', async () => {
      const rule = makeRuleResponse();
      mockedGet.mockResolvedValue({ data: rule });
      const result = await rulesApi.getRuleDetails('r1');
      expect(result).toEqual(rule);
    });

    it('propagates errors', async () => {
      mockedGet.mockRejectedValue(new Error('not found'));
      await expect(rulesApi.getRuleDetails('r1')).rejects.toThrow('not found');
    });
  });

  // ── deleteRule ───────────────────────────────────────────────────────────────

  describe('deleteRule', () => {
    it('calls DELETE on the correct endpoint with rule_key in body', async () => {
      mockedDelete.mockResolvedValue({ data: undefined });
      await rulesApi.deleteRule('r1');
      expect(mockedDelete).toHaveBeenCalledWith(
        '/api/v1/rules/r1',
        { data: { rule_key: 'r1' } }
      );
    });

    it('returns the response data', async () => {
      mockedDelete.mockResolvedValue({ data: { deleted: true } });
      const result = await rulesApi.deleteRule('r1');
      expect(result).toEqual({ deleted: true });
    });

    it('propagates errors', async () => {
      mockedDelete.mockRejectedValue(new Error('delete failed'));
      await expect(rulesApi.deleteRule('r1')).rejects.toThrow('delete failed');
    });
  });

  // ── updateRule ───────────────────────────────────────────────────────────────

  describe('updateRule', () => {
    const payload = {
      rule_key:   'r1',
      name:       'Updated Rule',
      description: 'New desc',
      updated_by: 'alice',
    };

    it('calls PUT on the correct endpoint', async () => {
      mockedPut.mockResolvedValue({ data: makeRuleResponse() });
      await rulesApi.updateRule(payload);
      expect(mockedPut).toHaveBeenCalledWith('/api/v1/rules/r1', payload);
    });

    it('returns the updated rule from the response', async () => {
      const rule = makeRuleResponse({ name: 'Updated Rule' });
      mockedPut.mockResolvedValue({ data: rule });
      const result = await rulesApi.updateRule(payload);
      expect(result).toEqual(rule);
    });

    it('propagates errors', async () => {
      mockedPut.mockRejectedValue(new Error('update failed'));
      await expect(rulesApi.updateRule(payload)).rejects.toThrow('update failed');
    });
  });

  // ── updateRuleDirectory ───────────────────────────────────────────────────────

  describe('updateRuleDirectory', () => {
    const payload = {
      rule_key:   'r1',
      updated_by: 'alice',
      directory:  'finance/new-folder',
    };

    it('calls PUT on the correct endpoint with only updated_by and directory in body', async () => {
      mockedPut.mockResolvedValue({ data: makeRuleResponse() });
      await rulesApi.updateRuleDirectory(payload);
      expect(mockedPut).toHaveBeenCalledWith(
        '/api/v1/rules/r1/directory',
        { updated_by: 'alice', directory: 'finance/new-folder' }
      );
    });

    it('does not include rule_key in the request body', async () => {
      mockedPut.mockResolvedValue({ data: makeRuleResponse() });
      await rulesApi.updateRuleDirectory(payload);
      const body = mockedPut.mock.calls[0][1] as Record<string, unknown>;
      expect(body).not.toHaveProperty('rule_key');
    });

    it('returns the updated rule from the response', async () => {
      const rule = makeRuleResponse({ directory: 'finance/new-folder' });
      mockedPut.mockResolvedValue({ data: rule });
      const result = await rulesApi.updateRuleDirectory(payload);
      expect(result).toEqual(rule);
    });

    it('propagates errors', async () => {
      mockedPut.mockRejectedValue(new Error('dir update failed'));
      await expect(rulesApi.updateRuleDirectory(payload)).rejects.toThrow('dir update failed');
    });
  });

  // ── updateRuleNameAndDirectory ────────────────────────────────────────────────

  describe('updateRuleNameAndDirectory', () => {
    const payload = {
      rule_key:    'r1',
      name:        'Renamed Rule',
      directory:   'finance/new-folder',
      description: 'Some desc',
      updated_by:  'alice',
    };

    beforeEach(() => {
      mockedPut.mockResolvedValue({ data: makeRuleResponse() });
    });

    it('calls updateRule with name, description, and updated_by', async () => {
      await rulesApi.updateRuleNameAndDirectory(payload);
      expect(mockedPut).toHaveBeenCalledWith(
        '/api/v1/rules/r1',
        expect.objectContaining({
          rule_key:    'r1',
          name:        'Renamed Rule',
          description: 'Some desc',
          updated_by:  'alice',
        })
      );
    });

    it('calls updateRuleDirectory with directory and updated_by', async () => {
      await rulesApi.updateRuleNameAndDirectory(payload);
      expect(mockedPut).toHaveBeenCalledWith(
        '/api/v1/rules/r1/directory',
        { updated_by: 'alice', directory: 'finance/new-folder' }
      );
    });

    it('makes exactly two PUT calls', async () => {
      await rulesApi.updateRuleNameAndDirectory(payload);
      expect(mockedPut).toHaveBeenCalledTimes(2);
    });

    it('returns { success: true }', async () => {
      const result = await rulesApi.updateRuleNameAndDirectory(payload);
      expect(result).toEqual({ success: true });
    });

    it('falls back to empty string when description is omitted', async () => {
      const { description: _, ...noDesc } = payload;
      void _;
      await rulesApi.updateRuleNameAndDirectory(noDesc);
      expect(mockedPut).toHaveBeenCalledWith(
        '/api/v1/rules/r1',
        expect.objectContaining({ description: '' })
      );
    });

    it('propagates errors from updateRule', async () => {
      mockedPut.mockRejectedValueOnce(new Error('update failed'));
      await expect(rulesApi.updateRuleNameAndDirectory(payload)).rejects.toThrow('update failed');
    });

    it('propagates errors from updateRuleDirectory', async () => {
      mockedPut
        .mockResolvedValueOnce({ data: makeRuleResponse() })
        .mockRejectedValueOnce(new Error('dir failed'));
      await expect(rulesApi.updateRuleNameAndDirectory(payload)).rejects.toThrow('dir failed');
    });
  });
});