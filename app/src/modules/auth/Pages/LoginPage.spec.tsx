import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── Hoisted spies (must be declared before vi.mock factories) ─────────────────
// vi.mock() calls are hoisted to the top of the file by Vitest's transformer.
// Any variable they reference must also be hoisted with vi.hoisted(); otherwise
// the factory runs before the `const mockXxx = vi.fn()` declarations and you
// get "Cannot access before initialization".

const {
  mockNavigate,
  mockSetAccessToken,
  mockSetIsAuthenticated,
  mockSetRoles,
  mockLoginApi,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSetAccessToken: vi.fn(),
  mockSetIsAuthenticated: vi.fn(),
  mockSetRoles: vi.fn(),
  mockLoginApi: vi.fn(),
}));

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/modules/auth/context/Authcontext', () => ({
  useAuth: () => ({
    setAccessToken: mockSetAccessToken,
    setIsAuthenticated: mockSetIsAuthenticated,
    setRoles: mockSetRoles,
  }),
}));

vi.mock('@/modules/auth/services/Authservice', () => ({
  loginApi: mockLoginApi,
}));

vi.mock('@/modules/auth/components/Loginleftpanel', () => ({
  default: () => <div data-testid="left-panel" />,
}));

vi.mock('@/modules/auth/components/Loginrightpanel', () => ({
  default: ({
    formData,
    loginMode,
    setLoginMode,
    loading,
    error,
    onChange,
    onSubmit,
  }: {
    formData: { username: string; emailid: string; password: string };
    loginMode: 'username' | 'email';
    setLoginMode: (m: 'username' | 'email') => void;
    loading: boolean;
    error: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
  }) => (
    <div data-testid="right-panel">
      <button data-testid="switch-to-email" onClick={() => setLoginMode('email')}>
        Email mode
      </button>
      <button data-testid="switch-to-username" onClick={() => setLoginMode('username')}>
        Username mode
      </button>

      <form data-testid="login-form" onSubmit={onSubmit}>
        <input
          data-testid="username-input"
          name="username"
          value={formData.username}
          onChange={onChange}
        />
        <input
          data-testid="emailid-input"
          name="emailid"
          value={formData.emailid}
          onChange={onChange}
        />
        <input
          data-testid="password-input"
          name="password"
          value={formData.password}
          onChange={onChange}
        />
        <button type="submit" data-testid="submit-btn" disabled={loading}>
          {loading ? 'Loading…' : 'Login'}
        </button>
      </form>

      {error && <p data-testid="error-msg">{error}</p>}
      <span data-testid="login-mode">{loginMode}</span>
    </div>
  ),
}));

vi.mock('@/core/theme/brmsTheme', () => ({
  brmsTheme: { colors: { bgDark: '#000' } },
}));

vi.mock('@mui/material', () => ({
  Box: ({ children, ...props }: React.PropsWithChildren<object>) =>
    React.createElement('div', props, children),
}));

vi.mock('@mui/material/styles', () => ({
  // styled(Component)(styles) → returns a real component function, not JSX
  styled: () => () =>
    function StyledBox({ children, ...props }: React.PropsWithChildren<object>) {
      return React.createElement('div', props, children);
    },
}));

// ── Module under test ─────────────────────────────────────────────────────────

import LoginPage from './LoginPage';

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderPage() {
  return render(<LoginPage />);
}

/**
 * Submit the form and wait for all resulting React state updates to flush.
 * Using `act` around fireEvent.submit ensures that synchronous state updates
 * (e.g. setError in validation) are processed, and the returned promise lets
 * callers await async state updates (setLoading, setError after loginApi).
 */
async function submitForm() {
  await act(async () => {
    fireEvent.submit(screen.getByTestId('login-form'));
  });
}

function fillUsername(value: string) {
  fireEvent.change(screen.getByTestId('username-input'), {
    target: { name: 'username', value },
  });
}

function fillEmailId(value: string) {
  fireEvent.change(screen.getByTestId('emailid-input'), {
    target: { name: 'emailid', value },
  });
}

function fillPassword(value: string) {
  fireEvent.change(screen.getByTestId('password-input'), {
    target: { name: 'password', value },
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LoginPage – rendering', () => {
  beforeEach(() => {
    mockLoginApi.mockReset();
    mockNavigate.mockReset();
  });

  it('renders the left and right panels', () => {
    renderPage();
    expect(screen.getByTestId('left-panel')).toBeInTheDocument();
    expect(screen.getByTestId('right-panel')).toBeInTheDocument();
  });

  it('starts in username login mode', () => {
    renderPage();
    expect(screen.getByTestId('login-mode').textContent).toBe('username');
  });

  it('starts with empty form fields', () => {
    renderPage();
    expect((screen.getByTestId('username-input') as HTMLInputElement).value).toBe('');
    expect((screen.getByTestId('emailid-input') as HTMLInputElement).value).toBe('');
    expect((screen.getByTestId('password-input') as HTMLInputElement).value).toBe('');
  });

  it('shows no error message initially', () => {
    renderPage();
    expect(screen.queryByTestId('error-msg')).not.toBeInTheDocument();
  });
});

// ── handleChange ──────────────────────────────────────────────────────────────

describe('LoginPage – handleChange', () => {
  beforeEach(() => mockLoginApi.mockReset());

  it('updates the username field', async () => {
    renderPage();
    await userEvent.type(screen.getByTestId('username-input'), 'alice');
    expect((screen.getByTestId('username-input') as HTMLInputElement).value).toBe('alice');
  });

  it('updates the password field', async () => {
    renderPage();
    await userEvent.type(screen.getByTestId('password-input'), 'secret');
    expect((screen.getByTestId('password-input') as HTMLInputElement).value).toBe('secret');
  });

  it('clears a previous error when the user types', async () => {
    renderPage();
    await submitForm();
    expect(screen.getByTestId('error-msg')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('username-input'), {
      target: { name: 'username', value: 'a' },
    });
    expect(screen.queryByTestId('error-msg')).not.toBeInTheDocument();
  });
});

// ── loginMode toggle ──────────────────────────────────────────────────────────

describe('LoginPage – loginMode toggle', () => {
  it('switches to email mode', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('switch-to-email'));
    expect(screen.getByTestId('login-mode').textContent).toBe('email');
  });

  it('switches back to username mode', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('switch-to-email'));
    fireEvent.click(screen.getByTestId('switch-to-username'));
    expect(screen.getByTestId('login-mode').textContent).toBe('username');
  });
});

// ── handleSubmit – validation ─────────────────────────────────────────────────

describe('LoginPage – handleSubmit validation', () => {
  beforeEach(() => mockLoginApi.mockReset());

  it('shows error when username and password are both empty', async () => {
    renderPage();
    await submitForm();
    expect(screen.getByTestId('error-msg').textContent).toBe('Please fill in all fields');
    expect(mockLoginApi).not.toHaveBeenCalled();
  });

  it('shows error when username is filled but password is empty', async () => {
    renderPage();
    fillUsername('alice');
    await submitForm();
    expect(screen.getByTestId('error-msg').textContent).toBe('Please fill in all fields');
    expect(mockLoginApi).not.toHaveBeenCalled();
  });

  it('shows error when password is filled but username is empty', async () => {
    renderPage();
    fillPassword('secret');
    await submitForm();
    expect(screen.getByTestId('error-msg').textContent).toBe('Please fill in all fields');
  });

  it('shows error when in email mode and emailid is empty', async () => {
    renderPage();
    fireEvent.click(screen.getByTestId('switch-to-email'));
    fillPassword('secret');
    await submitForm();
    expect(screen.getByTestId('error-msg').textContent).toBe('Please fill in all fields');
    expect(mockLoginApi).not.toHaveBeenCalled();
  });
});

// ── handleSubmit – success ────────────────────────────────────────────────────

describe('LoginPage – handleSubmit success', () => {
  beforeEach(() => {
    mockLoginApi.mockReset();
    mockNavigate.mockReset();
    mockSetAccessToken.mockReset();
    mockSetIsAuthenticated.mockReset();
    mockSetRoles.mockReset();
  });

  it('calls loginApi with username credentials and navigates on success', async () => {
    mockLoginApi.mockResolvedValueOnce({ accessToken: 'tok-abc', roles: ['admin'] });
    renderPage();

    fillUsername('alice');
    fillPassword('secret');
    await submitForm();

    await waitFor(() => {
      expect(mockLoginApi).toHaveBeenCalledOnce();
      expect(mockLoginApi).toHaveBeenCalledWith({ username: 'alice', password: 'secret' });
      expect(mockSetAccessToken).toHaveBeenCalledWith('tok-abc');
      expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
      expect(mockSetRoles).toHaveBeenCalledWith(['admin']);
      expect(mockNavigate).toHaveBeenCalledWith('/vertical');
    });
  });

  it('calls loginApi with email credentials in email mode', async () => {
    mockLoginApi.mockResolvedValueOnce({ accessToken: 'tok-xyz', roles: ['user'] });
    renderPage();

    fireEvent.click(screen.getByTestId('switch-to-email'));
    fillEmailId('alice@example.com');
    fillPassword('pass');
    await submitForm();

    await waitFor(() => {
      expect(mockLoginApi).toHaveBeenCalledOnce();
      expect(mockLoginApi).toHaveBeenCalledWith({
        emailid: 'alice@example.com',
        password: 'pass',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/vertical');
    });
  });

  it('clears loading state after successful login', async () => {
    mockLoginApi.mockResolvedValueOnce({ accessToken: 'tok', roles: [] });
    renderPage();

    fillUsername('alice');
    fillPassword('secret');
    await submitForm();

    expect(screen.getByTestId('submit-btn').textContent).toBe('Login');
  });
});

// ── handleSubmit – error ──────────────────────────────────────────────────────

describe('LoginPage – handleSubmit error', () => {
  beforeEach(() => {
    mockLoginApi.mockReset();
    mockNavigate.mockReset();
  });

  it('shows the error message from an Error instance', async () => {
    mockLoginApi.mockRejectedValueOnce(new Error('Invalid credentials'));
    renderPage();

    fillUsername('alice');
    fillPassword('wrong');
    await submitForm();

    expect(screen.getByTestId('error-msg').textContent).toBe('Invalid credentials');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows fallback message when a non-Error is thrown', async () => {
    mockLoginApi.mockRejectedValueOnce('string error');
    renderPage();

    fillUsername('alice');
    fillPassword('wrong');
    await submitForm();

    expect(screen.getByTestId('error-msg').textContent).toBe(
      'Login failed. Please try again.'
    );
  });

  it('clears loading state after a failed login', async () => {
    mockLoginApi.mockRejectedValueOnce(new Error('Bad creds'));
    renderPage();

    fillUsername('alice');
    fillPassword('wrong');
    await submitForm();

    expect(screen.getByTestId('submit-btn').textContent).toBe('Login');
  });

  it('does not navigate on error', async () => {
    mockLoginApi.mockRejectedValueOnce(new Error('Unauthorized'));
    renderPage();

    fillUsername('alice');
    fillPassword('wrong');
    await submitForm();

    expect(screen.getByTestId('error-msg')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});