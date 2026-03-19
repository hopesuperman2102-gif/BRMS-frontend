import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

let mockIsAuthenticated = false;
let mockPathname = '/dashboard';

vi.mock('react-router-dom', () => ({
  Navigate: ({ to, replace, state }: { to: string; replace?: boolean; state?: unknown }) => (
    <div
      data-testid="navigate"
      data-to={to}
      data-replace={String(replace)}
      data-state={JSON.stringify(state)}
    />
  ),
  useLocation: () => ({ pathname: mockPathname }),
}));

vi.mock('@/modules/auth/context/Authcontext', () => ({
  useAuth: () => ({ isAuthenticated: mockIsAuthenticated }),
}));

import RequireAuth from './RequireAuth';

// ─────────────────────────────────────────────────────────────────────────────
describe('RequireAuth', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockIsAuthenticated = false;
    mockPathname = '/dashboard';
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  // ── Unauthenticated ────────────────────────────────────────────────────────
  describe('when NOT authenticated', () => {
    it('renders the Navigate component', () => {
      render(
        <RequireAuth>
          <div>protected</div>
        </RequireAuth>,
      );
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
    });

    it('redirects to /login', () => {
      render(
        <RequireAuth>
          <div>protected</div>
        </RequireAuth>,
      );
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
    });

    it('passes replace prop to Navigate', () => {
      render(
        <RequireAuth>
          <div>protected</div>
        </RequireAuth>,
      );
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-replace', 'true');
    });

    it('passes current pathname as state.from', () => {
      mockPathname = '/dashboard';
      render(
        <RequireAuth>
          <div>protected</div>
        </RequireAuth>,
      );
      const state = JSON.parse(
        screen.getByTestId('navigate').getAttribute('data-state') ?? '{}',
      );
      expect(state.from).toBe('/dashboard');
    });

    it('passes correct state.from for a nested route', () => {
      mockPathname = '/settings/profile';
      render(
        <RequireAuth>
          <div>protected</div>
        </RequireAuth>,
      );
      const state = JSON.parse(
        screen.getByTestId('navigate').getAttribute('data-state') ?? '{}',
      );
      expect(state.from).toBe('/settings/profile');
    });

    it('does NOT render children', () => {
      render(
        <RequireAuth>
          <div data-testid="child">protected content</div>
        </RequireAuth>,
      );
      expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    });
  });

  // ── Authenticated ──────────────────────────────────────────────────────────
  describe('when authenticated', () => {
    beforeEach(() => {
      mockIsAuthenticated = true;
    });

    it('renders children', () => {
      render(
        <RequireAuth>
          <div data-testid="child">protected content</div>
        </RequireAuth>,
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders children text content', () => {
      render(
        <RequireAuth>
          <div>protected content</div>
        </RequireAuth>,
      );
      expect(screen.getByText('protected content')).toBeInTheDocument();
    });

    it('does NOT render the Navigate component', () => {
      render(
        <RequireAuth>
          <div>protected content</div>
        </RequireAuth>,
      );
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <RequireAuth>
          <div data-testid="child-1">first</div>
          <div data-testid="child-2">second</div>
        </RequireAuth>,
      );
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });
});