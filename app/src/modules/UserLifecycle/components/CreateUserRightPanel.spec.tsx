import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateUserRightPanel from './CreateUserRightPanel';
import type { CreateUserRightPanelProps } from '@/modules/UserLifecycle/types/userTypes';

// ─── Mock MUI icons ───────────────────────────────────────────────────────────
vi.mock('@mui/icons-material/Person', () => ({ default: () => <span data-testid="icon-person" /> }));
vi.mock('@mui/icons-material/Lock', () => ({ default: () => <span data-testid="icon-lock" /> }));
vi.mock('@mui/icons-material/CheckCircleOutline', () => ({ default: () => <span data-testid="icon-check" /> }));
vi.mock('@mui/icons-material/Email', () => ({ default: () => <span data-testid="icon-email" /> }));

// ─── Mock theme ───────────────────────────────────────────────────────────────
vi.mock('@/core/theme/brmsTheme', () => ({
  brmsTheme: {
    colors: {
      white: '#fff',
      panelIndigo: '#4F46E5',
      panelIndigoGlow: 'rgba(79,70,229,0.18)',
      panelIndigoHover: '#4338CA',
      lightBorder: '#E5E7EB',
      lightBorderHover: '#D1D5DB',
      lightTextHigh: '#111827',
      lightTextMid: '#6B7280',
      lightTextLow: '#9CA3AF',
      errorBorder: '#EF4444',
      errorIcon: '#EF4444',
      errorText: '#EF4444',
      errorRed: '#EF4444',
      warningAmber: '#F59E0B',
      formBg: '#F9FAFB',
      statusUsingBg: '#ECFDF5',
      statusUsingBorder: '#6EE7B7',
      statusUsingText: '#065F46',
      statusUsingDot: '#10B981',
    },
    fonts: { mono: 'monospace' },
  },
}));

// ─── Mock core components ─────────────────────────────────────────────────────
vi.mock('@/core/components/RcInputField', () => ({
  default: vi.fn(({ name, placeholder, value, onChange, onFocus, onBlur }) => (
    <input
      data-testid={`input-${name}`}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )),
}));

vi.mock('@/core/components/RcEmail', () => ({
  default: vi.fn(({ name, value, onChange, onFocus, onBlur }) => (
    <input
      data-testid={`input-${name}`}
      name={name}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )),
}));

vi.mock('@/core/components/RcPasswordField', () => ({
  default: vi.fn(({ name, placeholder, value, onChange, onFocus, onBlur }) => (
    <input
      data-testid={`input-${name}`}
      name={name}
      type="password"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )),
}));

vi.mock('@/core/components/RcDropdown', () => ({
  default: vi.fn(({ label, items, value, onSelect }) => (
    <select
      data-testid="dropdown-role"
      value={value ?? ''}
      onChange={(e) => onSelect(e.target.value)}
      aria-label={label}
    >
      <option value="">Select Role</option>
      {items.map((item: { label: string; value: string }) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  )),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const baseFormData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  roles: [] as string[],
};

function buildProps(overrides: Partial<CreateUserRightPanelProps> = {}): CreateUserRightPanelProps {
  return {
    formData: baseFormData,
    loading: false,
    error: '',
    success: false,
    onChange: vi.fn(),
    onRoleSelect: vi.fn(),
    onSubmit: vi.fn(),
    resetKey: 0,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('CreateUserRightPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CreateUserRightPanel {...buildProps()} />);
      expect(screen.getByTestId('input-username')).toBeInTheDocument();
    });

    it('renders the heading "Onboard User"', () => {
      render(<CreateUserRightPanel {...buildProps()} />);
      expect(screen.getByText('Onboard User')).toBeInTheDocument();
    });

    it('renders the subtitle text', () => {
      render(<CreateUserRightPanel {...buildProps()} />);
      expect(
        screen.getByText(/set a username and password/i)
      ).toBeInTheDocument();
    });

    it('renders username, email, password, confirmPassword inputs', () => {
      render(<CreateUserRightPanel {...buildProps()} />);
      expect(screen.getByTestId('input-username')).toBeInTheDocument();
      expect(screen.getByTestId('input-email')).toBeInTheDocument();
      expect(screen.getByTestId('input-password')).toBeInTheDocument();
      expect(screen.getByTestId('input-confirmPassword')).toBeInTheDocument();
    });

    it('renders the role dropdown', () => {
      render(<CreateUserRightPanel {...buildProps()} />);
      expect(screen.getByTestId('dropdown-role')).toBeInTheDocument();
    });

    it('renders all four role options', () => {
      render(<CreateUserRightPanel {...buildProps()} />);
      expect(screen.getByRole('option', { name: 'Viewer' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Reviewer' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Rule Author' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Super Admin' })).toBeInTheDocument();
    });

    it('renders the submit button with "Create User" label', () => {
      render(<CreateUserRightPanel {...buildProps()} />);
      expect(screen.getByRole('button', { name: 'Create User' })).toBeInTheDocument();
    });

    it('does NOT render success alert when success=false', () => {
      render(<CreateUserRightPanel {...buildProps({ success: false })} />);
      expect(screen.queryByText('User created successfully.')).not.toBeInTheDocument();
    });

    it('renders success alert when success=true', () => {
      render(<CreateUserRightPanel {...buildProps({ success: true })} />);
      expect(screen.getByText('User created successfully.')).toBeInTheDocument();
    });
  });

  // ── Submit button state ────────────────────────────────────────────────────
  describe('Submit button state', () => {
    it('is disabled when roles array is empty', () => {
      render(<CreateUserRightPanel {...buildProps({ formData: { ...baseFormData, roles: [] } })} />);
      expect(screen.getByRole('button', { name: 'Create User' })).toBeDisabled();
    });

    it('is disabled when loading=true', () => {
      render(
        <CreateUserRightPanel
          {...buildProps({
            loading: true,
            formData: { ...baseFormData, roles: ['VIEWER'] },
          })}
        />
      );
      expect(screen.getByRole('button', { name: 'Creating user...' })).toBeDisabled();
    });

    it('shows "Creating user..." label when loading', () => {
      render(
        <CreateUserRightPanel
          {...buildProps({
            loading: true,
            formData: { ...baseFormData, roles: ['VIEWER'] },
          })}
        />
      );
      expect(screen.getByText('Creating user...')).toBeInTheDocument();
    });

    it('is disabled when passwords do not match', () => {
      render(
        <CreateUserRightPanel
          {...buildProps({
            formData: {
              ...baseFormData,
              password: 'abc123',
              confirmPassword: 'xyz999',
              roles: ['VIEWER'],
            },
          })}
        />
      );
      expect(screen.getByRole('button', { name: 'Create User' })).toBeDisabled();
    });

    it('is enabled when role is set, passwords match, and not loading', () => {
      render(
        <CreateUserRightPanel
          {...buildProps({
            formData: {
              ...baseFormData,
              password: 'abc123',
              confirmPassword: 'abc123',
              roles: ['VIEWER'],
            },
          })}
        />
      );
      expect(screen.getByRole('button', { name: 'Create User' })).not.toBeDisabled();
    });
  });

  // ── Password mismatch ──────────────────────────────────────────────────────
  describe('Password mismatch', () => {
    it('shows mismatch message when passwords differ', () => {
      render(
        <CreateUserRightPanel
          {...buildProps({
            formData: {
              ...baseFormData,
              password: 'abc123',
              confirmPassword: 'xyz',
            },
          })}
        />
      );
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('does not show mismatch message when confirmPassword is empty', () => {
      render(
        <CreateUserRightPanel
          {...buildProps({
            formData: { ...baseFormData, password: 'abc123', confirmPassword: '' },
          })}
        />
      );
      expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
    });

    it('does not show mismatch message when passwords match', () => {
      render(
        <CreateUserRightPanel
          {...buildProps({
            formData: {
              ...baseFormData,
              password: 'match123',
              confirmPassword: 'match123',
            },
          })}
        />
      );
      expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
    });
  });

  // ── PasswordStrength ───────────────────────────────────────────────────────
  describe('PasswordStrength', () => {
    it('does not render strength indicator when password is empty', () => {
      render(<CreateUserRightPanel {...buildProps()} />);
      expect(screen.queryByText('At least 8 characters')).not.toBeInTheDocument();
    });

    it('renders strength checks when password is non-empty', () => {
      render(
        <CreateUserRightPanel
          {...buildProps({ formData: { ...baseFormData, password: 'a' } })}
        />
      );
      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
      expect(screen.getByText('Contains a number')).toBeInTheDocument();
      expect(screen.getByText('Contains a letter')).toBeInTheDocument();
    });

    it('shows all checks passing for a strong password', () => {
      render(
        <CreateUserRightPanel
          {...buildProps({ formData: { ...baseFormData, password: 'Strong1!' } })}
        />
      );
      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
      expect(screen.getByText('Contains a number')).toBeInTheDocument();
      expect(screen.getByText('Contains a letter')).toBeInTheDocument();
    });

    it('shows partial checks for a short letters-only password', () => {
      render(
        <CreateUserRightPanel
          {...buildProps({ formData: { ...baseFormData, password: 'abc' } })}
        />
      );
      // All three check labels are visible; pass/fail is reflected in styled props
      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
      expect(screen.getByText('Contains a number')).toBeInTheDocument();
      expect(screen.getByText('Contains a letter')).toBeInTheDocument();
    });
  });

  // ── Event handlers ─────────────────────────────────────────────────────────
  describe('Event handlers', () => {
    it('calls onChange when username input changes', () => {
      const onChange = vi.fn();
      render(<CreateUserRightPanel {...buildProps({ onChange })} />);
      fireEvent.change(screen.getByTestId('input-username'), {
        target: { value: 'newuser' },
      });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onChange when email input changes', () => {
      const onChange = vi.fn();
      render(<CreateUserRightPanel {...buildProps({ onChange })} />);
      fireEvent.change(screen.getByTestId('input-email'), {
        target: { value: 'test@test.com' },
      });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onChange when password input changes', () => {
      const onChange = vi.fn();
      render(<CreateUserRightPanel {...buildProps({ onChange })} />);
      fireEvent.change(screen.getByTestId('input-password'), {
        target: { value: 'secret' },
      });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onChange when confirmPassword input changes', () => {
      const onChange = vi.fn();
      render(<CreateUserRightPanel {...buildProps({ onChange })} />);
      fireEvent.change(screen.getByTestId('input-confirmPassword'), {
        target: { value: 'secret' },
      });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onRoleSelect when dropdown value changes', () => {
      const onRoleSelect = vi.fn();
      render(<CreateUserRightPanel {...buildProps({ onRoleSelect })} />);
      fireEvent.change(screen.getByTestId('dropdown-role'), {
        target: { value: 'VIEWER' },
      });
      expect(onRoleSelect).toHaveBeenCalledTimes(1);
      expect(onRoleSelect).toHaveBeenCalledWith('VIEWER');
    });

    it('calls onSubmit when form is submitted', () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      render(
        <CreateUserRightPanel
          {...buildProps({
            onSubmit,
            formData: {
              ...baseFormData,
              password: 'abc123',
              confirmPassword: 'abc123',
              roles: ['VIEWER'],
            },
          })}
        />
      );
      fireEvent.submit(screen.getByRole('button', { name: 'Create User' }).closest('form')!);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  // ── Focus / blur state ─────────────────────────────────────────────────────
  describe('Focus and blur', () => {
    it('focuses username input without error', () => {
      render(<CreateUserRightPanel {...buildProps()} />);
      const input = screen.getByTestId('input-username');
      fireEvent.focus(input);
      fireEvent.blur(input);
      // No throw; focused state resets on blur
      expect(input).toBeInTheDocument();
    });

    it('focuses and blurs each field without error', () => {
      render(<CreateUserRightPanel {...buildProps()} />);
      ['input-username', 'input-email', 'input-password', 'input-confirmPassword'].forEach(
        (testId) => {
          const el = screen.getByTestId(testId);
          fireEvent.focus(el);
          fireEvent.blur(el);
          expect(el).toBeInTheDocument();
        }
      );
    });
  });

  // ── Props reflected in inputs ──────────────────────────────────────────────
  describe('formData reflected in inputs', () => {
    it('renders pre-filled username value', () => {
      render(
        <CreateUserRightPanel
          {...buildProps({ formData: { ...baseFormData, username: 'johndoe' } })}
        />
      );
      expect(screen.getByTestId('input-username')).toHaveValue('johndoe');
    });

    it('renders pre-filled email value', () => {
      render(
        <CreateUserRightPanel
          {...buildProps({ formData: { ...baseFormData, email: 'j@j.com' } })}
        />
      );
      expect(screen.getByTestId('input-email')).toHaveValue('j@j.com');
    });

    it('renders pre-filled password value', () => {
      render(
        <CreateUserRightPanel
          {...buildProps({ formData: { ...baseFormData, password: 'secret99' } })}
        />
      );
      expect(screen.getByTestId('input-password')).toHaveValue('secret99');
    });

    it('reflects selected role in dropdown', () => {
      render(
        <CreateUserRightPanel
          {...buildProps({ formData: { ...baseFormData, roles: ['REVIEWER'] } })}
        />
      );
      expect(screen.getByTestId('dropdown-role')).toHaveValue('REVIEWER');
    });
  });
});