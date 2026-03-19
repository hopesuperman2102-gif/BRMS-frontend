import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRole } from './useRole';

// ─── Mocks ────────────────────────────────────────────────────────────────────

let mockRoles: string[] = [];

vi.mock('@/modules/auth/context/Authcontext', () => ({
  useAuth: () => ({ roles: mockRoles }),
}));


// ─────────────────────────────────────────────────────────────────────────────
describe('useRole', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockRoles = [];
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  // ── Return shape ───────────────────────────────────────────────────────────
  describe('return shape', () => {
    it('returns roles array from context', () => {
      mockRoles = ['RULE_AUTHOR'];
      const { result } = renderHook(() => useRole());
      expect(result.current.roles).toEqual(['RULE_AUTHOR']);
    });

    it('returns hasRole function', () => {
      const { result } = renderHook(() => useRole());
      expect(typeof result.current.hasRole).toBe('function');
    });

    it('returns all boolean flags', () => {
      const { result } = renderHook(() => useRole());
      expect(typeof result.current.isRuleAuthor).toBe('boolean');
      expect(typeof result.current.isSuperAdmin).toBe('boolean');
      expect(typeof result.current.isReviewer).toBe('boolean');
      expect(typeof result.current.isViewer).toBe('boolean');
    });
  });

  // ── hasRole ────────────────────────────────────────────────────────────────
  describe('hasRole', () => {
    it('returns true when role exists (exact case)', () => {
      mockRoles = ['RULE_AUTHOR'];
      const { result } = renderHook(() => useRole());
      expect(result.current.hasRole('RULE_AUTHOR')).toBe(true);
    });

    it('returns true when role matches case-insensitively', () => {
      mockRoles = ['rule_author'];
      const { result } = renderHook(() => useRole());
      expect(result.current.hasRole('RULE_AUTHOR')).toBe(true);
    });

    it('returns true when query is lowercase and role is uppercase', () => {
      mockRoles = ['SUPER_ADMIN'];
      const { result } = renderHook(() => useRole());
      expect(result.current.hasRole('super_admin')).toBe(true);
    });

    it('returns false when role does not exist', () => {
      mockRoles = ['VIEWER'];
      const { result } = renderHook(() => useRole());
      expect(result.current.hasRole('RULE_AUTHOR')).toBe(false);
    });

    it('returns false when roles array is empty', () => {
      mockRoles = [];
      const { result } = renderHook(() => useRole());
      expect(result.current.hasRole('RULE_AUTHOR')).toBe(false);
    });
  });

  // ── isRuleAuthor ───────────────────────────────────────────────────────────
  describe('isRuleAuthor', () => {
    it('is true when roles contains RULE_AUTHOR', () => {
      mockRoles = ['RULE_AUTHOR'];
      const { result } = renderHook(() => useRole());
      expect(result.current.isRuleAuthor).toBe(true);
    });

    it('is false when roles does not contain RULE_AUTHOR', () => {
      mockRoles = ['VIEWER'];
      const { result } = renderHook(() => useRole());
      expect(result.current.isRuleAuthor).toBe(false);
    });
  });

  // ── isSuperAdmin ───────────────────────────────────────────────────────────
  describe('isSuperAdmin', () => {
    it('is true when roles contains SUPER_ADMIN', () => {
      mockRoles = ['SUPER_ADMIN'];
      const { result } = renderHook(() => useRole());
      expect(result.current.isSuperAdmin).toBe(true);
    });

    it('is false when roles does not contain SUPER_ADMIN', () => {
      mockRoles = ['VIEWER'];
      const { result } = renderHook(() => useRole());
      expect(result.current.isSuperAdmin).toBe(false);
    });
  });

  // ── isReviewer ─────────────────────────────────────────────────────────────
  describe('isReviewer', () => {
    it('is true when roles contains REVIEWER', () => {
      mockRoles = ['REVIEWER'];
      const { result } = renderHook(() => useRole());
      expect(result.current.isReviewer).toBe(true);
    });

    it('is false when roles does not contain REVIEWER', () => {
      mockRoles = ['SUPER_ADMIN'];
      const { result } = renderHook(() => useRole());
      expect(result.current.isReviewer).toBe(false);
    });
  });

  // ── isViewer ───────────────────────────────────────────────────────────────
  describe('isViewer', () => {
    it('is true when roles contains VIEWER', () => {
      mockRoles = ['VIEWER'];
      const { result } = renderHook(() => useRole());
      expect(result.current.isViewer).toBe(true);
    });

    it('is false when roles does not contain VIEWER', () => {
      mockRoles = ['RULE_AUTHOR'];
      const { result } = renderHook(() => useRole());
      expect(result.current.isViewer).toBe(false);
    });
  });

  // ── Multiple roles ─────────────────────────────────────────────────────────
  describe('multiple roles', () => {
    it('correctly sets all flags when user has all roles', () => {
      mockRoles = ['RULE_AUTHOR', 'SUPER_ADMIN', 'REVIEWER', 'VIEWER'];
      const { result } = renderHook(() => useRole());
      expect(result.current.isRuleAuthor).toBe(true);
      expect(result.current.isSuperAdmin).toBe(true);
      expect(result.current.isReviewer).toBe(true);
      expect(result.current.isViewer).toBe(true);
    });

    it('only sets the matching flag when user has one role', () => {
      mockRoles = ['REVIEWER'];
      const { result } = renderHook(() => useRole());
      expect(result.current.isRuleAuthor).toBe(false);
      expect(result.current.isSuperAdmin).toBe(false);
      expect(result.current.isReviewer).toBe(true);
      expect(result.current.isViewer).toBe(false);
    });

    it('returns the raw roles array as-is', () => {
      mockRoles = ['RULE_AUTHOR', 'VIEWER'];
      const { result } = renderHook(() => useRole());
      expect(result.current.roles).toEqual(['RULE_AUTHOR', 'VIEWER']);
    });
  });
});