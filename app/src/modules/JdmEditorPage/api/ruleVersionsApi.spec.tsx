import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import type { DecisionGraphType } from '@gorules/jdm-editor';
import type {
  JdmRuleVersion,
  CreateRuleVersionRequest,
} from '@/modules/JdmEditorPage/types/jdmEditorEndpointsTypes';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('@/api/apiClient', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

// Mock console.error to prevent stderr pollution during error tests
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

import { ruleVersionsApi } from '@/modules/JdmEditorPage/api/ruleVersionsApi';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockGraph: DecisionGraphType = { nodes: [], edges: [] };

const versionA: JdmRuleVersion = {
  version: 'v3',
  checksum: 'abc123',
  is_valid: true,
  created_by: 'alice',
  created_at: '2026-01-01T00:00:00Z',
  jdm: mockGraph,
};

const versionB: JdmRuleVersion = {
  version: 'v2',
  checksum: 'def456',
  is_valid: true,
  created_by: 'bob',
  created_at: '2025-12-01T00:00:00Z',
};

const createRequest: CreateRuleVersionRequest = {
  rule_key: 'rule-99',
  jdm: mockGraph,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ruleVersionsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── listVersions ─────────────────────────────────────────────────────────────

  describe('listVersions', () => {
    it('calls the correct endpoint with the rule_key', async () => {
      mockGet.mockResolvedValueOnce({ data: [versionA, versionB] });

      await ruleVersionsApi.listVersions('rule-42');

      expect(mockGet).toHaveBeenCalledWith('/api/v1/rules/rule-42/versions');
    });

    it('returns the list of versions from response.data', async () => {
      mockGet.mockResolvedValueOnce({ data: [versionA, versionB] });

      const result = await ruleVersionsApi.listVersions('rule-42');

      expect(result).toEqual([versionA, versionB]);
    });

    it('returns an empty array when no versions exist', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      const result = await ruleVersionsApi.listVersions('rule-42');

      expect(result).toEqual([]);
    });

    it('calls GET exactly once', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      await ruleVersionsApi.listVersions('rule-42');

      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('interpolates different rule_key values into the URL', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      await ruleVersionsApi.listVersions('my-special-rule');

      expect(mockGet).toHaveBeenCalledWith('/api/v1/rules/my-special-rule/versions');
    });

    it('re-throws when GET rejects with a network error', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network Error'));

      await expect(ruleVersionsApi.listVersions('rule-42')).rejects.toThrow('Network Error');
    });

    it('re-throws when GET rejects with a 404 error', async () => {
      const notFound = Object.assign(new Error('Not Found'), {
        response: { status: 404 },
      });
      mockGet.mockRejectedValueOnce(notFound);

      await expect(ruleVersionsApi.listVersions('rule-42')).rejects.toThrow('Not Found');
    });

    it('re-throws non-Error objects', async () => {
      mockGet.mockRejectedValueOnce({ code: 'TIMEOUT' });

      await expect(ruleVersionsApi.listVersions('rule-42')).rejects.toMatchObject({
        code: 'TIMEOUT',
      });
    });
  });

  // ── createVersion ─────────────────────────────────────────────────────────────

  describe('createVersion', () => {
    it('calls the correct endpoint using rule_key from request body', async () => {
      mockPost.mockResolvedValueOnce({ data: versionA });

      await ruleVersionsApi.createVersion(createRequest);

      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/rules/rule-99/versions',
        createRequest,
      );
    });

    it('returns the created version from response.data', async () => {
      mockPost.mockResolvedValueOnce({ data: versionA });

      const result = await ruleVersionsApi.createVersion(createRequest);

      expect(result).toEqual(versionA);
    });

    it('passes the full request body including jdm to POST', async () => {
      mockPost.mockResolvedValueOnce({ data: versionA });

      await ruleVersionsApi.createVersion(createRequest);

      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ jdm: mockGraph, rule_key: 'rule-99' }),
      );
    });

    it('calls POST exactly once', async () => {
      mockPost.mockResolvedValueOnce({ data: versionA });

      await ruleVersionsApi.createVersion(createRequest);

      expect(mockPost).toHaveBeenCalledTimes(1);
    });

    it('interpolates different rule_key values into the URL', async () => {
      mockPost.mockResolvedValueOnce({ data: versionA });
      const req: CreateRuleVersionRequest = { rule_key: 'another-rule', jdm: mockGraph };

      await ruleVersionsApi.createVersion(req);

      expect(mockPost).toHaveBeenCalledWith('/api/v1/rules/another-rule/versions', req);
    });

    it('re-throws when POST rejects with a network error', async () => {
      mockPost.mockRejectedValueOnce(new Error('Network Error'));

      await expect(ruleVersionsApi.createVersion(createRequest)).rejects.toThrow('Network Error');
    });

    it('re-throws when POST rejects with a 500 error', async () => {
      const serverError = Object.assign(new Error('Internal Server Error'), {
        response: { status: 500 },
      });
      mockPost.mockRejectedValueOnce(serverError);

      await expect(ruleVersionsApi.createVersion(createRequest)).rejects.toThrow(
        'Internal Server Error',
      );
    });

    it('re-throws non-Error objects', async () => {
      mockPost.mockRejectedValueOnce({ code: 'CONFLICT' });

      await expect(ruleVersionsApi.createVersion(createRequest)).rejects.toMatchObject({
        code: 'CONFLICT',
      });
    });
  });

  // ── getVersionData ────────────────────────────────────────────────────────────

  describe('getVersionData', () => {
    it('calls the correct endpoint with rule_key and version', async () => {
      mockGet.mockResolvedValueOnce({ data: { jdm: mockGraph } });

      await ruleVersionsApi.getVersionData('rule-42', 'v3');

      expect(mockGet).toHaveBeenCalledWith('/api/v1/rules/rule-42/versions/v3');
    });

    it('returns the jdm object from response.data', async () => {
      mockGet.mockResolvedValueOnce({ data: { jdm: mockGraph } });

      const result = await ruleVersionsApi.getVersionData('rule-42', 'v3');

      expect(result).toEqual({ jdm: mockGraph });
    });

    it('interpolates different rule_key and version into the URL', async () => {
      mockGet.mockResolvedValueOnce({ data: { jdm: mockGraph } });

      await ruleVersionsApi.getVersionData('special-rule', 'v10');

      expect(mockGet).toHaveBeenCalledWith('/api/v1/rules/special-rule/versions/v10');
    });

    it('calls GET exactly once', async () => {
      mockGet.mockResolvedValueOnce({ data: { jdm: mockGraph } });

      await ruleVersionsApi.getVersionData('rule-42', 'v3');

      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('returns response with a graph that has nodes and edges', async () => {
      const graphWithNodes: DecisionGraphType = {
        nodes: [{ id: 'n1', name: 'Node', type: 'expression', position: { x: 0, y: 0 } }],
        edges: [{ id: 'e1', sourceId: 'n1', targetId: 'n2' }],
      };
      mockGet.mockResolvedValueOnce({ data: { jdm: graphWithNodes } });

      const result = await ruleVersionsApi.getVersionData('rule-42', 'v1');

      expect(result.jdm).toEqual(graphWithNodes);
    });

    it('re-throws when GET rejects with a network error', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network Error'));

      await expect(ruleVersionsApi.getVersionData('rule-42', 'v3')).rejects.toThrow(
        'Network Error',
      );
    });

    it('re-throws when GET rejects with a 404 error', async () => {
      const notFound = Object.assign(new Error('Not Found'), {
        response: { status: 404 },
      });
      mockGet.mockRejectedValueOnce(notFound);

      await expect(ruleVersionsApi.getVersionData('rule-42', 'v3')).rejects.toThrow('Not Found');
    });

    it('re-throws non-Error objects', async () => {
      mockGet.mockRejectedValueOnce({ code: 'ECONNREFUSED' });

      await expect(ruleVersionsApi.getVersionData('rule-42', 'v3')).rejects.toMatchObject({
        code: 'ECONNREFUSED',
      });
    });
  });
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});