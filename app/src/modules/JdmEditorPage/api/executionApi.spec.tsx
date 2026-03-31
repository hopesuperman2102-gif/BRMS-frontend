import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DecisionGraphType } from '@gorules/jdm-editor';
import type { ExecuteResponse, JsonObject } from '@/modules/JdmEditorPage/types/jdmEditorEndpointsTypes';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPost = vi.fn();

vi.mock('@/api/apiClient', () => ({
  __esModule: true,
  default: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

import { executionApi } from '@/modules/JdmEditorPage/api/executionApi';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockGraph: DecisionGraphType = { nodes: [], edges: [] };

const mockInput: JsonObject = { userId: '42', amount: 100 };

const successResponse: ExecuteResponse = {
  status: 'success',
  result: { approved: true },
  performance: '8ms',
  trace: { step1: 'passed' },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('executionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Happy path ───────────────────────────────────────────────────────────────

  it('calls the correct endpoint with jdm and input in the body', async () => {
    mockPost.mockResolvedValueOnce({ data: successResponse });

    await executionApi.execute(mockGraph, mockInput);

    expect(mockPost).toHaveBeenCalledWith(
      '/api/v1/execution/simulate',
      { jdm: mockGraph, input: mockInput },
    );
  });

  it('returns the response data on success', async () => {
    mockPost.mockResolvedValueOnce({ data: successResponse });

    const result = await executionApi.execute(mockGraph, mockInput);

    expect(result).toEqual(successResponse);
  });

  it('calls POST exactly once per execute call', async () => {
    mockPost.mockResolvedValueOnce({ data: successResponse });

    await executionApi.execute(mockGraph, mockInput);

    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('passes an empty input object correctly', async () => {
    mockPost.mockResolvedValueOnce({ data: successResponse });

    await executionApi.execute(mockGraph, {});

    expect(mockPost).toHaveBeenCalledWith(
      '/api/v1/execution/simulate',
      { jdm: mockGraph, input: {} },
    );
  });

  it('passes a graph with nodes and edges correctly', async () => {
    const graphWithNodes: DecisionGraphType = {
      nodes: [{ id: 'n1', name: 'Rule', type: 'expression', position: { x: 0, y: 0 } }],
      edges: [{ id: 'e1', sourceId: 'n1', targetId: 'n2' }],
    };
    mockPost.mockResolvedValueOnce({ data: successResponse });

    await executionApi.execute(graphWithNodes, mockInput);

    expect(mockPost).toHaveBeenCalledWith(
      '/api/v1/execution/simulate',
      { jdm: graphWithNodes, input: mockInput },
    );
  });

  // ── Response shapes ──────────────────────────────────────────────────────────

  it('returns response with status "error" as-is without throwing', async () => {
    const errorResponse: ExecuteResponse = {
      status: 'error',
      error: 'rule failed',
      message: 'evaluation error',
    };
    mockPost.mockResolvedValueOnce({ data: errorResponse });

    const result = await executionApi.execute(mockGraph, mockInput);

    expect(result).toEqual(errorResponse);
  });

  it('returns response with status "SUCCESS" (uppercase) as-is', async () => {
    const upperResponse: ExecuteResponse = { status: 'SUCCESS', result: {} };
    mockPost.mockResolvedValueOnce({ data: upperResponse });

    const result = await executionApi.execute(mockGraph, mockInput);

    expect(result).toEqual(upperResponse);
  });

  it('returns response that has no optional fields (minimal shape)', async () => {
    const minimalResponse: ExecuteResponse = {};
    mockPost.mockResolvedValueOnce({ data: minimalResponse });

    const result = await executionApi.execute(mockGraph, mockInput);

    expect(result).toEqual(minimalResponse);
  });

  // ── Error propagation ────────────────────────────────────────────────────────

  it('re-throws when axiosInstance.post rejects with a network error', async () => {
    const networkError = new Error('Network Error');
    mockPost.mockRejectedValueOnce(networkError);

    await expect(executionApi.execute(mockGraph, mockInput)).rejects.toThrow('Network Error');
  });

  it('re-throws when axiosInstance.post rejects with a 500 error', async () => {
    const serverError = Object.assign(new Error('Request failed with status code 500'), {
      response: { status: 500, data: { message: 'Internal Server Error' } },
    });
    mockPost.mockRejectedValueOnce(serverError);

    await expect(executionApi.execute(mockGraph, mockInput)).rejects.toThrow(
      'Request failed with status code 500',
    );
  });

  it('re-throws when axiosInstance.post rejects with a 401 error', async () => {
    const authError = Object.assign(new Error('Unauthorized'), {
      response: { status: 401 },
    });
    mockPost.mockRejectedValueOnce(authError);

    await expect(executionApi.execute(mockGraph, mockInput)).rejects.toThrow('Unauthorized');
  });

  it('re-throws non-Error objects thrown by axiosInstance.post', async () => {
    mockPost.mockRejectedValueOnce({ code: 'CUSTOM_ERROR' });

    await expect(executionApi.execute(mockGraph, mockInput)).rejects.toMatchObject({
      code: 'CUSTOM_ERROR',
    });
  });
});