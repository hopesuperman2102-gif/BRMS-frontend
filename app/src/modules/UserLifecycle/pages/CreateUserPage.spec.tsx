import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import React from 'react';
import CreateUserPage from './CreateUserPage';
import type { UserManagementResponse } from '@/modules/UserLifecycle/types/userEndpointsTypes';

// ─── Mock theme ───────────────────────────────────────────────────────────────
vi.mock('@/core/theme/brmsTheme', () => ({
  brmsTheme: { colors: { bgRoot: '#F9FAFB' } },
}));

// ─── Mock CreateUserApi ───────────────────────────────────────────────────────
const mockCreateUser = vi.fn();
vi.mock('@/modules/UserLifecycle/api/createUserApi', () => ({
  CreateUserApi: { createUser: (...args: unknown[]) => mockCreateUser(...args) },
}));

// ─── Mock RcAlertComponent + useAlertStore ────────────────────────────────────
const mockShowAlert = vi.fn();
vi.mock('@/core/components/RcAlertComponent', () => ({
  default: () => <div data-testid="rc-alert" />,
  useAlertStore: () => ({ showAlert: mockShowAlert }),
}));

// ─── Mock CreateUserLeftPanel ─────────────────────────────────────────────────
vi.mock('@/modules/UserLifecycle/components/CreateUserLeftPanel', () => ({
  default: vi.fn(({ newUser }) => (
    <div
      data-testid="left-panel"
      data-new-user={JSON.stringify(newUser ?? null)}
    />
  )),
}));

// ─── Mock CreateUserRightPanel ────────────────────────────────────────────────
vi.mock('@/modules/UserLifecycle/components/CreateUserRightPanel', () => ({
  default: vi.fn(({
    formData, loading, error, success,
    onChange, onRoleSelect, onSubmit, resetKey,
  }) => (
    <div data-testid="right-panel">
      <span data-testid="rp-loading">{loading ? 'true' : 'false'}</span>
      <span data-testid="rp-error">{error}</span>
      <span data-testid="rp-success">{success ? 'true' : 'false'}</span>
      <span data-testid="rp-reset-key">{resetKey}</span>
      <span data-testid="rp-username">{formData.username}</span>
      <span data-testid="rp-email">{formData.email}</span>
      <span data-testid="rp-password">{formData.password}</span>
      <span data-testid="rp-confirm">{formData.confirmPassword}</span>
      <span data-testid="rp-roles">{formData.roles.join(',')}</span>
      <input
        data-testid="input-username"
        name="username"
        value={formData.username}
        onChange={onChange}
      />
      <input
        data-testid="input-email"
        name="email"
        value={formData.email}
        onChange={onChange}
      />
      <input
        data-testid="input-password"
        name="password"
        value={formData.password}
        onChange={onChange}
      />
      <input
        data-testid="input-confirm"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={onChange}
      />
      <button data-testid="select-role" onClick={() => onRoleSelect('VIEWER')}>
        Select Role
      </button>
      <button data-testid="submit-btn" onClick={onSubmit}>
        Submit
      </button>
    </div>
  )),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const createdUser: UserManagementResponse = {
  id: 'new-1',
  username: 'alice',
  email: 'alice@test.com',
  roles: ['VIEWER'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fillForm({
  username = 'alice',
  email = 'alice@test.com',
  password = 'Password1!',
  confirmPassword = 'Password1!',
  selectRole = true,
}: {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  selectRole?: boolean;
} = {}) {
  fireEvent.change(screen.getByTestId('input-username'), {
    target: { name: 'username', value: username },
  });
  fireEvent.change(screen.getByTestId('input-email'), {
    target: { name: 'email', value: email },
  });
  fireEvent.change(screen.getByTestId('input-password'), {
    target: { name: 'password', value: password },
  });
  fireEvent.change(screen.getByTestId('input-confirm'), {
    target: { name: 'confirmPassword', value: confirmPassword },
  });
  if (selectRole) fireEvent.click(screen.getByTestId('select-role'));
}

function submit() {
  fireEvent.click(screen.getByTestId('submit-btn'));
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('CreateUserPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Real timers by default — fake timers are only activated in the one test
    // that specifically needs to advance setTimeout.
    mockCreateUser.mockResolvedValue(createdUser);
  });

  afterEach(() => {
    cleanup();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CreateUserPage />);
      expect(screen.getByTestId('right-panel')).toBeInTheDocument();
    });

    it('renders the left panel', () => {
      render(<CreateUserPage />);
      expect(screen.getByTestId('left-panel')).toBeInTheDocument();
    });

    it('renders RcAlertComponent', () => {
      render(<CreateUserPage />);
      expect(screen.getByTestId('rc-alert')).toBeInTheDocument();
    });

    it('passes null newUser to left panel initially', () => {
      render(<CreateUserPage />);
      expect(
        JSON.parse(screen.getByTestId('left-panel').getAttribute('data-new-user')!)
      ).toBeNull();
    });

    it('renders right panel with empty formData initially', () => {
      render(<CreateUserPage />);
      expect(screen.getByTestId('rp-username')).toHaveTextContent('');
      expect(screen.getByTestId('rp-email')).toHaveTextContent('');
      expect(screen.getByTestId('rp-password')).toHaveTextContent('');
      expect(screen.getByTestId('rp-confirm')).toHaveTextContent('');
      expect(screen.getByTestId('rp-roles')).toHaveTextContent('');
    });

    it('renders right panel with loading=false, success=false, resetKey=0 initially', () => {
      render(<CreateUserPage />);
      expect(screen.getByTestId('rp-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('rp-success')).toHaveTextContent('false');
      expect(screen.getByTestId('rp-reset-key')).toHaveTextContent('0');
    });
  });

  // ── handleChange ───────────────────────────────────────────────────────────
  describe('handleChange', () => {
    it('updates username in formData', () => {
      render(<CreateUserPage />);
      fireEvent.change(screen.getByTestId('input-username'), {
        target: { name: 'username', value: 'johndoe' },
      });
      expect(screen.getByTestId('rp-username')).toHaveTextContent('johndoe');
    });

    it('updates email in formData', () => {
      render(<CreateUserPage />);
      fireEvent.change(screen.getByTestId('input-email'), {
        target: { name: 'email', value: 'j@j.com' },
      });
      expect(screen.getByTestId('rp-email')).toHaveTextContent('j@j.com');
    });

    it('updates password in formData', () => {
      render(<CreateUserPage />);
      fireEvent.change(screen.getByTestId('input-password'), {
        target: { name: 'password', value: 'secret99' },
      });
      expect(screen.getByTestId('rp-password')).toHaveTextContent('secret99');
    });

    it('clears error when onChange is called', async () => {
      render(<CreateUserPage />);
      await act(async () => { submit(); });
      expect(screen.getByTestId('rp-error')).not.toHaveTextContent('');
      fireEvent.change(screen.getByTestId('input-username'), {
        target: { name: 'username', value: 'a' },
      });
      expect(screen.getByTestId('rp-error')).toHaveTextContent('');
    });

    it('clears success when onChange is called', async () => {
      render(<CreateUserPage />);
      fillForm();
      await act(async () => { submit(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-success')).toHaveTextContent('true')
      );
      fireEvent.change(screen.getByTestId('input-username'), {
        target: { name: 'username', value: 'x' },
      });
      expect(screen.getByTestId('rp-success')).toHaveTextContent('false');
    });
  });

  // ── handleRoleSelect ───────────────────────────────────────────────────────
  describe('handleRoleSelect', () => {
    it('sets role in formData', () => {
      render(<CreateUserPage />);
      fireEvent.click(screen.getByTestId('select-role'));
      expect(screen.getByTestId('rp-roles')).toHaveTextContent('VIEWER');
    });

    it('clears error when role is selected', async () => {
      render(<CreateUserPage />);
      await act(async () => { submit(); });
      expect(screen.getByTestId('rp-error')).not.toHaveTextContent('');
      fireEvent.click(screen.getByTestId('select-role'));
      expect(screen.getByTestId('rp-error')).toHaveTextContent('');
    });

    it('clears success when role is selected', async () => {
      render(<CreateUserPage />);
      fillForm();
      await act(async () => { submit(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-success')).toHaveTextContent('true')
      );
      fireEvent.click(screen.getByTestId('select-role'));
      expect(screen.getByTestId('rp-success')).toHaveTextContent('false');
    });
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  describe('Validation', () => {
    it('shows error when username is empty', async () => {
      render(<CreateUserPage />);
      await act(async () => { submit(); });
      expect(screen.getByTestId('rp-error')).toHaveTextContent('Username is required.');
      expect(mockShowAlert).toHaveBeenCalledWith('Username is required.', 'error');
    });

    it('shows error when username is too short (< 3 chars)', async () => {
      render(<CreateUserPage />);
      fireEvent.change(screen.getByTestId('input-username'), {
        target: { name: 'username', value: 'ab' },
      });
      await act(async () => { submit(); });
      expect(screen.getByTestId('rp-error')).toHaveTextContent(
        'Username must be at least 3 characters.'
      );
    });

    it('shows error when email is empty', async () => {
      render(<CreateUserPage />);
      fireEvent.change(screen.getByTestId('input-username'), {
        target: { name: 'username', value: 'alice' },
      });
      await act(async () => { submit(); });
      expect(screen.getByTestId('rp-error')).toHaveTextContent('Email is required.');
    });

    it('shows error when email is invalid', async () => {
      render(<CreateUserPage />);
      fireEvent.change(screen.getByTestId('input-username'), {
        target: { name: 'username', value: 'alice' },
      });
      fireEvent.change(screen.getByTestId('input-email'), {
        target: { name: 'email', value: 'not-an-email' },
      });
      await act(async () => { submit(); });
      expect(screen.getByTestId('rp-error')).toHaveTextContent(
        'Please enter a valid email address.'
      );
    });

    it('shows error when password is empty', async () => {
      render(<CreateUserPage />);
      fireEvent.change(screen.getByTestId('input-username'), {
        target: { name: 'username', value: 'alice' },
      });
      fireEvent.change(screen.getByTestId('input-email'), {
        target: { name: 'email', value: 'alice@test.com' },
      });
      await act(async () => { submit(); });
      expect(screen.getByTestId('rp-error')).toHaveTextContent('Password is required.');
    });

    it('shows error when password is shorter than 8 characters', async () => {
      render(<CreateUserPage />);
      fireEvent.change(screen.getByTestId('input-username'), {
        target: { name: 'username', value: 'alice' },
      });
      fireEvent.change(screen.getByTestId('input-email'), {
        target: { name: 'email', value: 'alice@test.com' },
      });
      fireEvent.change(screen.getByTestId('input-password'), {
        target: { name: 'password', value: 'short' },
      });
      await act(async () => { submit(); });
      expect(screen.getByTestId('rp-error')).toHaveTextContent(
        'Password must be at least 8 characters.'
      );
    });

    it('shows error when passwords do not match', async () => {
      render(<CreateUserPage />);
      fireEvent.change(screen.getByTestId('input-username'), {
        target: { name: 'username', value: 'alice' },
      });
      fireEvent.change(screen.getByTestId('input-email'), {
        target: { name: 'email', value: 'alice@test.com' },
      });
      fireEvent.change(screen.getByTestId('input-password'), {
        target: { name: 'password', value: 'Password1!' },
      });
      fireEvent.change(screen.getByTestId('input-confirm'), {
        target: { name: 'confirmPassword', value: 'Different1!' },
      });
      await act(async () => { submit(); });
      expect(screen.getByTestId('rp-error')).toHaveTextContent('Passwords do not match.');
    });

    it('shows error when no role is selected', async () => {
      render(<CreateUserPage />);
      fillForm({ selectRole: false });
      await act(async () => { submit(); });
      expect(screen.getByTestId('rp-error')).toHaveTextContent('Please select a role.');
    });

    it('does not call createUser when validation fails', async () => {
      render(<CreateUserPage />);
      await act(async () => { submit(); });
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('calls showAlert once per validation failure', async () => {
      render(<CreateUserPage />);
      await act(async () => { submit(); });
      expect(mockShowAlert).toHaveBeenCalledTimes(1);
    });
  });

  // ── Successful submission ──────────────────────────────────────────────────
  describe('Successful submission', () => {
    it('calls createUser with correct trimmed payload', async () => {
      render(<CreateUserPage />);
      fillForm({ username: '  alice  ', email: '  alice@test.com  ' });
      await act(async () => { submit(); });
      expect(mockCreateUser).toHaveBeenCalledWith({
        username: 'alice',
        email: 'alice@test.com',
        password: 'Password1!',
        roles: ['VIEWER'],
      });
    });

    it('sets success=true after successful creation', async () => {
      render(<CreateUserPage />);
      fillForm();
      await act(async () => { submit(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-success')).toHaveTextContent('true')
      );
    });

    it('passes created user to left panel after success', async () => {
      render(<CreateUserPage />);
      fillForm();
      await act(async () => { submit(); });
      await waitFor(() => {
        const newUser = JSON.parse(
          screen.getByTestId('left-panel').getAttribute('data-new-user')!
        );
        expect(newUser).toEqual(createdUser);
      });
    });

    it('resets formData after successful creation', async () => {
      render(<CreateUserPage />);
      fillForm();
      await act(async () => { submit(); });
      await waitFor(() => {
        expect(screen.getByTestId('rp-username')).toHaveTextContent('');
        expect(screen.getByTestId('rp-email')).toHaveTextContent('');
        expect(screen.getByTestId('rp-roles')).toHaveTextContent('');
      });
    });

    it('increments resetKey after successful creation', async () => {
      render(<CreateUserPage />);
      fillForm();
      await act(async () => { submit(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-reset-key')).toHaveTextContent('1')
      );
    });

    it('sets loading=true during submission', async () => {
      let resolveCreate!: (v: UserManagementResponse) => void;
      mockCreateUser.mockReturnValueOnce(
        new Promise<UserManagementResponse>((res) => { resolveCreate = res; })
      );
      render(<CreateUserPage />);
      fillForm();
      act(() => { submit(); });
      expect(screen.getByTestId('rp-loading')).toHaveTextContent('true');
      await act(async () => { resolveCreate(createdUser); });
    });

    it('sets loading=false after submission completes', async () => {
      render(<CreateUserPage />);
      fillForm();
      await act(async () => { submit(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-loading')).toHaveTextContent('false')
      );
    });

    it('clears error before submission attempt', async () => {
      render(<CreateUserPage />);
      await act(async () => { submit(); });
      expect(screen.getByTestId('rp-error')).not.toHaveTextContent('');
      fillForm();
      await act(async () => { submit(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-error')).toHaveTextContent('')
      );
    });

    it('sets success=false after 3000ms', async () => {
      // Only this test uses fake timers — scoped locally so nothing else is affected
      vi.useFakeTimers({ shouldAdvanceTime: true });
      try {
        render(<CreateUserPage />);
        fillForm();
        await act(async () => { submit(); });
        await waitFor(() =>
          expect(screen.getByTestId('rp-success')).toHaveTextContent('true')
        );
        act(() => { vi.advanceTimersByTime(3000); });
        expect(screen.getByTestId('rp-success')).toHaveTextContent('false');
      } finally {
        vi.useRealTimers();
      }
    });
  });

  // ── API error handling ─────────────────────────────────────────────────────
  describe('API error handling', () => {
    it('sets error message when createUser rejects with an Error', async () => {
      mockCreateUser.mockRejectedValue(new Error('Server error'));
      render(<CreateUserPage />);
      fillForm();
      await act(async () => { submit(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-error')).toHaveTextContent('Server error')
      );
    });

    it('calls showAlert with error message on API failure', async () => {
      mockCreateUser.mockRejectedValue(new Error('API down'));
      render(<CreateUserPage />);
      fillForm();
      await act(async () => { submit(); });
      await waitFor(() =>
        expect(mockShowAlert).toHaveBeenCalledWith('API down', 'error')
      );
    });

    it('sets fallback error when rejection is not an Error instance', async () => {
      mockCreateUser.mockRejectedValue('unknown');
      render(<CreateUserPage />);
      fillForm();
      await act(async () => { submit(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-error')).toHaveTextContent(
          'Failed to create user. Please try again.'
        )
      );
    });

    it('sets loading=false after API error', async () => {
      mockCreateUser.mockRejectedValue(new Error('fail'));
      render(<CreateUserPage />);
      fillForm();
      await act(async () => { submit(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-loading')).toHaveTextContent('false')
      );
    });

    it('does not set success=true when createUser rejects', async () => {
      mockCreateUser.mockRejectedValue(new Error('fail'));
      render(<CreateUserPage />);
      fillForm();
      await act(async () => { submit(); });
      await waitFor(() =>
        expect(screen.getByTestId('rp-loading')).toHaveTextContent('false')
      );
      expect(screen.getByTestId('rp-success')).toHaveTextContent('false');
    });
  });

  // ── Mock call verification ─────────────────────────────────────────────────
  describe('Mock call verification', () => {
    it('CreateUserLeftPanel receives null newUser initially', async () => {
      const { default: CreateUserLeftPanel } = await import(
        '@/modules/UserLifecycle/components/CreateUserLeftPanel'
      );
      const mocked = vi.mocked(CreateUserLeftPanel);
      render(<CreateUserPage />);
      const lastCall = mocked.mock.calls[mocked.mock.calls.length - 1];
      expect(lastCall[0].newUser).toBeNull();
    });

    it('CreateUserRightPanel receives all required prop types', async () => {
      const { default: CreateUserRightPanel } = await import(
        '@/modules/UserLifecycle/components/CreateUserRightPanel'
      );
      const mocked = vi.mocked(CreateUserRightPanel);
      render(<CreateUserPage />);
      const lastCall = mocked.mock.calls[mocked.mock.calls.length - 1];
      expect(typeof lastCall[0].onChange).toBe('function');
      expect(typeof lastCall[0].onRoleSelect).toBe('function');
      expect(typeof lastCall[0].onSubmit).toBe('function');
      expect(lastCall[0].loading).toBe(false);
      expect(lastCall[0].success).toBe(false);
      expect(lastCall[0].resetKey).toBe(0);
    });
  });
});