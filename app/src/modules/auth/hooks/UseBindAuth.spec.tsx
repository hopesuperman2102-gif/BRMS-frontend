import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBindAuth } from './Usebindauth';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockBindAuthToAxios = vi.fn();
const mockGetAccessToken = vi.fn();
const mockSetAccessToken = vi.fn();

vi.mock('@/api/apiClient', () => ({
  bindAuthToAxios: (...args: unknown[]) => mockBindAuthToAxios(...args),
}));

vi.mock('@/modules/auth/context/Authcontext', () => ({
  useAuth: () => ({
    getAccessToken: mockGetAccessToken,
    setAccessToken: mockSetAccessToken,
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────
describe('useBindAuth', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockBindAuthToAxios.mockReset();
    mockGetAccessToken.mockReset();
    mockSetAccessToken.mockReset();
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  // ── Binding ────────────────────────────────────────────────────────────────
  describe('bindAuthToAxios call', () => {
    it('calls bindAuthToAxios on mount', () => {
      renderHook(() => useBindAuth());
      expect(mockBindAuthToAxios).toHaveBeenCalledTimes(1);
    });

    it('passes getAccessToken as the first argument', () => {
      renderHook(() => useBindAuth());
      expect(mockBindAuthToAxios).toHaveBeenCalledWith(
        mockGetAccessToken,
        expect.anything(),
      );
    });

    it('passes setAccessToken as the second argument', () => {
      renderHook(() => useBindAuth());
      expect(mockBindAuthToAxios).toHaveBeenCalledWith(
        expect.anything(),
        mockSetAccessToken,
      );
    });

    it('passes both getAccessToken and setAccessToken together', () => {
      renderHook(() => useBindAuth());
      expect(mockBindAuthToAxios).toHaveBeenCalledWith(
        mockGetAccessToken,
        mockSetAccessToken,
      );
    });
  });

  // ── Re-render behaviour ────────────────────────────────────────────────────
  describe('re-render behaviour', () => {
    it('does not call bindAuthToAxios again on re-render when deps unchanged', () => {
      const { rerender } = renderHook(() => useBindAuth());
      rerender();
      // useLayoutEffect with stable deps — should still be 1
      expect(mockBindAuthToAxios).toHaveBeenCalledTimes(1);
    });
  });

  // ── Return value ───────────────────────────────────────────────────────────
  describe('return value', () => {
    it('returns undefined', () => {
      const { result } = renderHook(() => useBindAuth());
      expect(result.current).toBeUndefined();
    });
  });
});