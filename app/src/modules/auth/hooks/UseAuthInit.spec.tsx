import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthInit } from './UseAuthInit';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRefreshApi = vi.fn();

vi.mock('@/modules/auth/services/Authservice', () => ({
  refreshApi: () => mockRefreshApi(),
}));

// ─────────────────────────────────────────────────────────────────────────────
describe('useAuthInit', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockRefreshApi.mockReset();
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  // ── Initial state ──────────────────────────────────────────────────────────
  describe('Initial state', () => {
    it('starts with isReady false', () => {
      mockRefreshApi.mockReturnValue(new Promise(() => {})); // never resolves
      const { result } = renderHook(() => useAuthInit());
      expect(result.current.isReady).toBe(false);
    });

    it('starts with isAuthenticated false', () => {
      mockRefreshApi.mockReturnValue(new Promise(() => {})); // never resolves
      const { result } = renderHook(() => useAuthInit());
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ── Authenticated ──────────────────────────────────────────────────────────
  describe('when refreshApi returns a token', () => {
    it('sets isReady to true', async () => {
      mockRefreshApi.mockResolvedValue('access-token-abc');
      const { result } = renderHook(() => useAuthInit());
      await act(async () => {});
      expect(result.current.isReady).toBe(true);
    });

    it('sets isAuthenticated to true', async () => {
      mockRefreshApi.mockResolvedValue('access-token-abc');
      const { result } = renderHook(() => useAuthInit());
      await act(async () => {});
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  // ── Unauthenticated ────────────────────────────────────────────────────────
  describe('when refreshApi returns null', () => {
    it('sets isReady to true', async () => {
      mockRefreshApi.mockResolvedValue(null);
      const { result } = renderHook(() => useAuthInit());
      await act(async () => {});
      expect(result.current.isReady).toBe(true);
    });

    it('sets isAuthenticated to false', async () => {
      mockRefreshApi.mockResolvedValue(null);
      const { result } = renderHook(() => useAuthInit());
      await act(async () => {});
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ── Falsy token values ─────────────────────────────────────────────────────
  describe('when refreshApi returns falsy values', () => {
    it.each([null, undefined, ''])('treats %s as unauthenticated', async (falsy) => {
      mockRefreshApi.mockResolvedValue(falsy);
      const { result } = renderHook(() => useAuthInit());
      await act(async () => {});
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isReady).toBe(true);
    });
  });

  // ── Cleanup / cancellation ─────────────────────────────────────────────────
  describe('cleanup on unmount', () => {
    it('does not update state after unmount (cancelled flag)', async () => {
      let resolveRefresh!: (val: string) => void;
      mockRefreshApi.mockReturnValue(
        new Promise<string>((res) => { resolveRefresh = res; }),
      );

      const { result, unmount } = renderHook(() => useAuthInit());

      // Unmount before the promise resolves
      unmount();

      // Now resolve — state setters should NOT be called
      await act(async () => { resolveRefresh('tok'); });

      // State should still be at initial values (no update after unmount)
      expect(result.current.isReady).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});