import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VerticalView } from '@/modules/vertical/types/verticalEndpointsTypes';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/api/apiClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import axiosInstance from '@/api/apiClient';
import { verticalsApi } from './verticalsApi';

const mockedGet = vi.mocked(axiosInstance.get);

// ── Fixtures ───────────────────────────────────────────────────────────────────

const MOCK_VERTICALS: VerticalView[] = [
  { id: '1', vertical_key: 'finance', vertical_name: 'Finance', description: 'Finance desc' },
  { id: '2', vertical_key: 'health', vertical_name: 'Health', description: 'Health desc' },
  { id: '3', vertical_key: 'ops', vertical_name: 'Operations', description: 'Ops desc' },
];

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('verticalsApi', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── getVerticalsView ───────────────────────────────────────────────────────

  describe('getVerticalsView', () => {
    it('calls axiosInstance.get with the correct endpoint', async () => {
      mockedGet.mockResolvedValue({ data: MOCK_VERTICALS });

      await verticalsApi.getVerticalsView();

      expect(mockedGet).toHaveBeenCalledWith('/api/v1/verticals');
    });

    it('calls axiosInstance.get exactly once', async () => {
      mockedGet.mockResolvedValue({ data: MOCK_VERTICALS });

      await verticalsApi.getVerticalsView();

      expect(mockedGet).toHaveBeenCalledTimes(1);
    });

    it('returns the data array from the response', async () => {
      mockedGet.mockResolvedValue({ data: MOCK_VERTICALS });

      const result = await verticalsApi.getVerticalsView();

      expect(result).toEqual(MOCK_VERTICALS);
    });

    it('returns an empty array when response.data is empty', async () => {
      mockedGet.mockResolvedValue({ data: [] });

      const result = await verticalsApi.getVerticalsView();

      expect(result).toEqual([]);
    });

    it('returns a single-item array correctly', async () => {
      const single: VerticalView[] = [MOCK_VERTICALS[0]];
      mockedGet.mockResolvedValue({ data: single });

      const result = await verticalsApi.getVerticalsView();

      expect(result).toEqual(single);
    });

    it('propagates errors thrown by axiosInstance.get', async () => {
      const networkError = new Error('Network Error');
      mockedGet.mockRejectedValue(networkError);

      await expect(verticalsApi.getVerticalsView()).rejects.toThrow('Network Error');
    });

    it('propagates axios 404 errors', async () => {
      const notFoundError = Object.assign(new Error('Request failed with status code 404'), {
        response: { status: 404 },
      });
      mockedGet.mockRejectedValue(notFoundError);

      await expect(verticalsApi.getVerticalsView()).rejects.toThrow('404');
    });

    it('propagates axios 500 errors', async () => {
      const serverError = Object.assign(new Error('Request failed with status code 500'), {
        response: { status: 500 },
      });
      mockedGet.mockRejectedValue(serverError);

      await expect(verticalsApi.getVerticalsView()).rejects.toThrow('500');
    });

    it('returns response.data directly without transformation', async () => {
      mockedGet.mockResolvedValue({ data: MOCK_VERTICALS });

      const result = await verticalsApi.getVerticalsView();

      // Confirm it is the exact same reference from response.data
      expect(result).toBe(MOCK_VERTICALS);
    });
  });

  // ── getVerticalKeyById ─────────────────────────────────────────────────────

  describe('getVerticalKeyById', () => {
    it('returns the vertical_key for a matching id', async () => {
      mockedGet.mockResolvedValue({ data: MOCK_VERTICALS });

      const result = await verticalsApi.getVerticalKeyById('1');

      expect(result).toBe('finance');
    });

    it('returns the vertical_key for the second vertical', async () => {
      mockedGet.mockResolvedValue({ data: MOCK_VERTICALS });

      const result = await verticalsApi.getVerticalKeyById('2');

      expect(result).toBe('health');
    });

    it('returns the vertical_key for the third vertical', async () => {
      mockedGet.mockResolvedValue({ data: MOCK_VERTICALS });

      const result = await verticalsApi.getVerticalKeyById('3');

      expect(result).toBe('ops');
    });

    it('throws "Vertical not found" when id does not exist', async () => {
      mockedGet.mockResolvedValue({ data: MOCK_VERTICALS });

      await expect(verticalsApi.getVerticalKeyById('999')).rejects.toThrow(
        'Vertical not found'
      );
    });

    it('throws "Vertical not found" when verticals list is empty', async () => {
      mockedGet.mockResolvedValue({ data: [] });

      await expect(verticalsApi.getVerticalKeyById('1')).rejects.toThrow(
        'Vertical not found'
      );
    });

    it('throws an Error instance when id does not exist', async () => {
      mockedGet.mockResolvedValue({ data: MOCK_VERTICALS });

      await expect(verticalsApi.getVerticalKeyById('not-real')).rejects.toBeInstanceOf(Error);
    });

    it('calls getVerticalsView internally (axiosInstance.get called once)', async () => {
      mockedGet.mockResolvedValue({ data: MOCK_VERTICALS });

      await verticalsApi.getVerticalKeyById('1');

      expect(mockedGet).toHaveBeenCalledTimes(1);
      expect(mockedGet).toHaveBeenCalledWith('/api/v1/verticals');
    });

    it('propagates network errors from getVerticalsView', async () => {
      const networkError = new Error('Network Error');
      mockedGet.mockRejectedValue(networkError);

      await expect(verticalsApi.getVerticalKeyById('1')).rejects.toThrow('Network Error');
    });

    it('matches by id strictly — does not match partial id strings', async () => {
      mockedGet.mockResolvedValue({ data: MOCK_VERTICALS });

      // '12' should not match id '1' or '2'
      await expect(verticalsApi.getVerticalKeyById('12')).rejects.toThrow(
        'Vertical not found'
      );
    });

    it('handles a single-item list and finds the correct key', async () => {
      mockedGet.mockResolvedValue({ data: [MOCK_VERTICALS[1]] });

      const result = await verticalsApi.getVerticalKeyById('2');

      expect(result).toBe('health');
    });

    it('handles a single-item list and throws when id does not match', async () => {
      mockedGet.mockResolvedValue({ data: [MOCK_VERTICALS[0]] });

      await expect(verticalsApi.getVerticalKeyById('2')).rejects.toThrow(
        'Vertical not found'
      );
    });
  });
});