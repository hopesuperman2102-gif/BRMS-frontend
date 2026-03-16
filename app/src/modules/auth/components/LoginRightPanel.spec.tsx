import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock('@/core/theme/brmsTheme', () => ({
  brmsTheme: {
    colors: {
      white: '#ffffff',
      formBg: '#f5f5f5',
      panelIndigo: '#6366f1',
      panelIndigoGlow: 'rgba(99,102,241,0.5)',
      panelIndigoHover: '#4f46e5',
      lightBorder: '#e0e0e0',
      lightBorderHover: '#bdbdbd',
      lightTextHigh: '#111827',
      lightTextMid: '#6b7280',
      lightTextLow: '#9ca3af',
      errorBg: '#fef2f2',
      errorBorder: '#fca5a5',
      errorText: '#b91c1c',
      errorIcon: '#ef4444',
    },
    fonts: { mono: '"JetBrains Mono", monospace' },
  },
}));

// ─── Shared input mock type ───────────────────────────────────────────────────

interface MockInputProps {
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onFocus: React.FocusEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  startIcon?: React.ReactNode;
  autoComplete?: string;
  required?: boolean;
  maxLength?: number;
  sx?: object;
}

vi.mock('@/core/components/RcInputField', () => ({
  default: ({ name, value, onChange, onFocus, onBlur, placeholder }: MockInputProps) => (
    <input
      data-testid={`input-${name}`}
      name={name}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('@/core/components/RcEmail', () => ({
  default: ({ name, value, onChange, onFocus, onBlur }: MockInputProps) => (
    <input
      data-testid={`input-${name}`}
      name={name}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder="email"
    />
  ),
}));

vi.mock('@/core/components/RcPasswordField', () => ({
  default: ({ name, value, onChange, onFocus, onBlur, placeholder }: MockInputProps) => (
    <input
      data-testid={`input-${name}`}
      name={name}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      type="password"
    />
  ),
}));

vi.mock('@mui/icons-material/Person', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="PersonIcon" {...props} />,
}));

vi.mock('@mui/icons-material/Lock', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="LockIcon" {...props} />,
}));

vi.mock('@mui/icons-material', () => ({
  Email: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="EmailIcon" {...props} />,
}));

import { LoginRightPanelProps } from '@/modules/auth/types/loginTypes';
import LoginRightPanel from './Loginrightpanel';


// ─── Default props factory ────────────────────────────────────────────────────

const makeProps = (
  overrides: Partial<Omit<LoginRightPanelProps, 'error'>> & { error?: string } = {},
): LoginRightPanelProps => ({
  formData: { username: '', password: '', emailid: '' },
  loading: false,
  loginMode: 'username',
  setLoginMode: vi.fn(),
  error: '',
  onChange: vi.fn(),
  onSubmit: vi.fn((e) => e.preventDefault()),
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
describe('LoginRightPanel', () => {
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

  // ── Rendering ──────────────────────────────────────────────────────────────
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<LoginRightPanel {...makeProps()} />);
      expect(container.firstChild).toBeTruthy();
    });

    it('renders the "Sign in" heading', () => {
      render(<LoginRightPanel {...makeProps()} />);
      expect(screen.getByText('Sign in')).toBeInTheDocument();
    });

    it('renders the subtitle text', () => {
      render(<LoginRightPanel {...makeProps()} />);
      expect(
        screen.getByText(/enter your credentials to access your workspace/i),
      ).toBeInTheDocument();
    });

    it('renders the submit button', () => {
      render(<LoginRightPanel {...makeProps()} />);
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders the "Forgot password?" link', () => {
      render(<LoginRightPanel {...makeProps()} />);
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('"Forgot password?" links to /forgot-password', () => {
      render(<LoginRightPanel {...makeProps()} />);
      const link = screen.getByText(/forgot password/i).closest('a');
      expect(link).toHaveAttribute('href', '/forgot-password');
    });

    it('renders the "Sign In with Email" checkbox label', () => {
      render(<LoginRightPanel {...makeProps()} />);
      expect(screen.getByText(/sign in with email/i)).toBeInTheDocument();
    });
  });

  // ── Username mode ──────────────────────────────────────────────────────────
  describe('Username mode', () => {
    it('renders the Username label', () => {
      render(<LoginRightPanel {...makeProps({ loginMode: 'username' })} />);
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('renders the username input field', () => {
      render(<LoginRightPanel {...makeProps({ loginMode: 'username' })} />);
      expect(screen.getByTestId('input-username')).toBeInTheDocument();
    });

    it('renders the Password label', () => {
      render(<LoginRightPanel {...makeProps()} />);
      expect(screen.getByText('Password')).toBeInTheDocument();
    });

    it('renders the password input field', () => {
      render(<LoginRightPanel {...makeProps()} />);
      expect(screen.getByTestId('input-password')).toBeInTheDocument();
    });

    it('checkbox is unchecked in username mode', () => {
      render(<LoginRightPanel {...makeProps({ loginMode: 'username' })} />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });
  });

  // ── Email mode ─────────────────────────────────────────────────────────────
  describe('Email mode', () => {
    it('renders the Email label', () => {
      render(<LoginRightPanel {...makeProps({ loginMode: 'email' })} />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders the email input field', () => {
      render(<LoginRightPanel {...makeProps({ loginMode: 'email' })} />);
      expect(screen.getByTestId('input-emailid')).toBeInTheDocument();
    });

    it('does NOT render username input in email mode', () => {
      render(<LoginRightPanel {...makeProps({ loginMode: 'email' })} />);
      expect(screen.queryByTestId('input-username')).not.toBeInTheDocument();
    });

    it('checkbox is checked in email mode', () => {
      render(<LoginRightPanel {...makeProps({ loginMode: 'email' })} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  // ── Error alert ────────────────────────────────────────────────────────────
  describe('Error alert', () => {
    it('does not render an alert when error is empty string', () => {
      render(<LoginRightPanel {...makeProps({ error: '' })} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('renders the alert when error is provided', () => {
      render(<LoginRightPanel {...makeProps({ error: 'Invalid credentials' })} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('displays the error message text', () => {
      render(<LoginRightPanel {...makeProps({ error: 'Invalid credentials' })} />);
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('renders different error messages correctly', () => {
      render(<LoginRightPanel {...makeProps({ error: 'Account locked' })} />);
      expect(screen.getByText('Account locked')).toBeInTheDocument();
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────
  describe('Loading state', () => {
    it('shows "Signing in…" text when loading', () => {
      render(<LoginRightPanel {...makeProps({ loading: true })} />);
      expect(screen.getByText('Signing in…')).toBeInTheDocument();
    });

    it('shows "Sign In" text when not loading', () => {
      render(<LoginRightPanel {...makeProps({ loading: false })} />);
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('submit button is disabled when loading', () => {
      render(<LoginRightPanel {...makeProps({ loading: true })} />);
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });

    it('submit button is enabled when not loading', () => {
      render(<LoginRightPanel {...makeProps({ loading: false })} />);
      expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled();
    });
  });

  // ── Interactions ───────────────────────────────────────────────────────────
  describe('Interactions', () => {
    it('calls onChange when username input changes', () => {
      const onChange = vi.fn();
      render(<LoginRightPanel {...makeProps({ onChange })} />);
      fireEvent.change(screen.getByTestId('input-username'), { target: { value: 'testuser' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onChange when password input changes', () => {
      const onChange = vi.fn();
      render(<LoginRightPanel {...makeProps({ onChange })} />);
      fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'secret' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit when form is submitted', () => {
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      render(<LoginRightPanel {...makeProps({ onSubmit })} />);
      fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls setLoginMode with "email" when checkbox is checked', () => {
      const setLoginMode = vi.fn();
      render(<LoginRightPanel {...makeProps({ loginMode: 'username', setLoginMode })} />);
      fireEvent.click(screen.getByRole('checkbox'));
      expect(setLoginMode).toHaveBeenCalledWith('email');
    });

    it('calls setLoginMode with "username" when checkbox is unchecked', () => {
      const setLoginMode = vi.fn();
      render(<LoginRightPanel {...makeProps({ loginMode: 'email', setLoginMode })} />);
      fireEvent.click(screen.getByRole('checkbox'));
      expect(setLoginMode).toHaveBeenCalledWith('username');
    });

    it('calls onChange when email input changes in email mode', () => {
      const onChange = vi.fn();
      render(<LoginRightPanel {...makeProps({ loginMode: 'email', onChange })} />);
      fireEvent.change(screen.getByTestId('input-emailid'), { target: { value: 'user@example.com' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  // ── Focus and blur ─────────────────────────────────────────────────────────
  describe('Focus and blur', () => {
    it('does not crash when username input is focused', () => {
      render(<LoginRightPanel {...makeProps()} />);
      fireEvent.focus(screen.getByTestId('input-username'));
      expect(screen.getByTestId('input-username')).toBeInTheDocument();
    });

    it('does not crash when username input is blurred', () => {
      render(<LoginRightPanel {...makeProps()} />);
      fireEvent.focus(screen.getByTestId('input-username'));
      fireEvent.blur(screen.getByTestId('input-username'));
      expect(screen.getByTestId('input-username')).toBeInTheDocument();
    });

    it('does not crash when password input is focused and blurred', () => {
      render(<LoginRightPanel {...makeProps()} />);
      fireEvent.focus(screen.getByTestId('input-password'));
      fireEvent.blur(screen.getByTestId('input-password'));
      expect(screen.getByTestId('input-password')).toBeInTheDocument();
    });

    it('does not crash when email input is focused and blurred', () => {
      render(<LoginRightPanel {...makeProps({ loginMode: 'email' })} />);
      fireEvent.focus(screen.getByTestId('input-emailid'));
      fireEvent.blur(screen.getByTestId('input-emailid'));
      expect(screen.getByTestId('input-emailid')).toBeInTheDocument();
    });
  });

  // ── Form field values ──────────────────────────────────────────────────────
  describe('Form field values', () => {
    it('reflects username value from formData', () => {
      render(<LoginRightPanel {...makeProps({ formData: { username: 'john', password: '', emailid: '' } })} />);
      expect(screen.getByTestId('input-username')).toHaveValue('john');
    });

    it('reflects password value from formData', () => {
      render(<LoginRightPanel {...makeProps({ formData: { username: '', password: 'secret', emailid: '' } })} />);
      expect(screen.getByTestId('input-password')).toHaveValue('secret');
    });

    it('reflects emailid value from formData in email mode', () => {
      render(
        <LoginRightPanel
          {...makeProps({ loginMode: 'email', formData: { username: '', password: '', emailid: 'a@b.com' } })}
        />,
      );
      expect(screen.getByTestId('input-emailid')).toHaveValue('a@b.com');
    });
  });

  // ── Required badges ────────────────────────────────────────────────────────
  describe('Required badges', () => {
    it('renders at least 2 "required" badges', () => {
      render(<LoginRightPanel {...makeProps()} />);
      expect(screen.getAllByText('required').length).toBeGreaterThanOrEqual(2);
    });
  });
});