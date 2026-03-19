import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';

vi.mock('@/modules/auth/types/authTypes', () => ({}));

import { AuthProvider, useAuth } from './Authcontext';

// ─── Helper — renders a consumer component inside AuthProvider ────────────────

function TestConsumer() {
  const {
    isAuthenticated,
    setIsAuthenticated,
    roles,
    setRoles,
    getAccessToken,
    setAccessToken,
  } = useAuth();

  return (
    <div>
      <span data-testid="isAuthenticated">{String(isAuthenticated)}</span>
      <span data-testid="roles">{roles.join(',')}</span>
      <span data-testid="accessToken">{getAccessToken() ?? 'null'}</span>
      <button onClick={() => setIsAuthenticated(true)}>setAuth</button>
      <button onClick={() => setRoles(['admin', 'user'])}>setRoles</button>
      <button onClick={() => setAccessToken('tok-123')}>setToken</button>
      <button onClick={() => setAccessToken(null)}>clearToken</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
describe('AuthProvider', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  // ── Initial state ──────────────────────────────────────────────────────────
  describe('Initial state', () => {
    it('renders children', () => {
      renderWithProvider();
      expect(screen.getByTestId('isAuthenticated')).toBeInTheDocument();
    });

    it('isAuthenticated defaults to false', () => {
      renderWithProvider();
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    });

    it('roles defaults to empty array', () => {
      renderWithProvider();
      expect(screen.getByTestId('roles').textContent).toBe('');
    });

    it('accessToken defaults to null', () => {
      renderWithProvider();
      expect(screen.getByTestId('accessToken').textContent).toBe('null');
    });
  });

  // ── setIsAuthenticated ─────────────────────────────────────────────────────
  describe('setIsAuthenticated', () => {
    it('updates isAuthenticated to true', () => {
      renderWithProvider();
      act(() => {
        screen.getByText('setAuth').click();
      });
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
    });
  });

  // ── setRoles ───────────────────────────────────────────────────────────────
  describe('setRoles', () => {
    it('updates roles state', () => {
      renderWithProvider();
      act(() => {
        screen.getByText('setRoles').click();
      });
      expect(screen.getByTestId('roles').textContent).toBe('admin,user');
    });
  });

  // ── setAccessToken / getAccessToken ───────────────────────────────────────
  describe('setAccessToken / getAccessToken', () => {
    it('sets and retrieves the access token', () => {
      // setAccessToken writes to a ref — does NOT trigger re-render so DOM
      // won't update. Call getAccessToken() synchronously after setting it.
      let capturedToken: string | null = null;

      function TokenReader() {
        const { setAccessToken, getAccessToken } = useAuth();
        return (
          <button
            onClick={() => {
              setAccessToken('tok-123');
              capturedToken = getAccessToken();
            }}
          >
            readToken
          </button>
        );
      }

      render(
        <AuthProvider>
          <TokenReader />
        </AuthProvider>,
      );

      act(() => { screen.getByText('readToken').click(); });
      expect(capturedToken).toBe('tok-123');
    });

    it('clears the access token when set to null', () => {
      renderWithProvider();
      act(() => {
        screen.getByText('setToken').click();
      });
      act(() => {
        screen.getByText('clearToken').click();
      });
      expect(screen.getByTestId('accessToken').textContent).toBe('null');
    });

    it('token update does not trigger a re-render (ref-based)', () => {
      // setAccessToken stores in a ref — calling it should not cause
      // isAuthenticated or roles to change as a side effect
      renderWithProvider();
      act(() => {
        screen.getByText('setToken').click();
      });
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
      expect(screen.getByTestId('roles').textContent).toBe('');
    });
  });

  // ── Multiple state updates ─────────────────────────────────────────────────
  describe('Multiple state updates', () => {
    it('handles setIsAuthenticated and setRoles together', () => {
      renderWithProvider();
      act(() => {
        screen.getByText('setAuth').click();
        screen.getByText('setRoles').click();
      });
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      expect(screen.getByTestId('roles').textContent).toBe('admin,user');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('useAuth', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('returns context when used inside AuthProvider', () => {
    function CheckContext() {
      const ctx = useAuth();
      return <span data-testid="ok">{ctx ? 'yes' : 'no'}</span>;
    }
    render(
      <AuthProvider>
        <CheckContext />
      </AuthProvider>,
    );
    expect(screen.getByTestId('ok').textContent).toBe('yes');
  });

  it('throws when used outside AuthProvider', () => {
    function BadConsumer() {
      useAuth();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow(
      'useAuth must be used inside AuthProvider',
    );
  });
});