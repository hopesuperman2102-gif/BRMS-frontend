import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import UpdatePasswordDialog from './UpdatePasswordDialog';
import type { UpdatePasswordDialogProps } from '@/modules/UserLifecycle/types/userTypes';

// ─── Mock MUI icons ───────────────────────────────────────────────────────────
vi.mock('@mui/icons-material/Lock', () => ({ default: () => <span data-testid="icon-lock" /> }));
vi.mock('@mui/icons-material/Close', () => ({ default: () => <span data-testid="icon-close" /> }));
vi.mock('@mui/icons-material/Visibility', () => ({ default: () => <span data-testid="icon-visibility" /> }));
vi.mock('@mui/icons-material/VisibilityOff', () => ({ default: () => <span data-testid="icon-visibility-off" /> }));

// ─── Mock theme ───────────────────────────────────────────────────────────────
vi.mock('@/core/theme/brmsTheme', () => ({
  brmsTheme: {
    colors: {
      white: '#fff',
      panelIndigo: '#4F46E5',
      panelIndigoGlow: 'rgba(79,70,229,0.18)',
      panelIndigoHover: '#4338CA',
      panelTextMid: '#6B7280',
      lightBorder: '#E5E7EB',
      lightBorderHover: '#D1D5DB',
      lightTextHigh: '#111827',
      lightTextMid: '#6B7280',
      lightTextLow: '#9CA3AF',
      errorBorder: '#EF4444',
      errorIcon: '#EF4444',
      errorText: '#EF4444',
      errorRed: '#EF4444',
      errorBg: '#FEF2F2',
      warningAmber: '#F59E0B',
      formBg: '#F9FAFB',
      statusUsingBg: '#ECFDF5',
      statusUsingBorder: '#6EE7B7',
      statusUsingText: '#065F46',
      statusUsingDot: '#10B981',
      textOnPrimary: '#111827',
    },
    fonts: { mono: 'monospace' },
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildProps(overrides: Partial<UpdatePasswordDialogProps> = {}): UpdatePasswordDialogProps {
  return {
    open: true,
    userId: 'user-123',
    onClose: vi.fn(),
    onChangePassword: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function getNewPasswordInput() {
  return screen.getAllByPlaceholderText('********')[0];
}

function getConfirmPasswordInput() {
  return screen.getAllByPlaceholderText('********')[1];
}

/** Finds Update Password / Updating... button without matching the <h2> title */
function getUpdateButton() {
  return screen.getAllByRole('button').find(
    (btn) => btn.textContent === 'Update Password' || btn.textContent === 'Updating...'
  )!;
}

/** Always uses [0] so multiple icons from accumulated renders don't matter */
function getCloseButton() {
  return screen.getAllByTestId('icon-close')[0].closest('button')!;
}

/** The FIRST visibility-toggle button belongs to the new password field */
function getNewPasswordToggleButton() {
  return screen.getAllByRole('button').find(
    (btn) =>
      btn.querySelector('[data-testid="icon-visibility"]') ||
      btn.querySelector('[data-testid="icon-visibility-off"]')
  )!;
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('UpdatePasswordDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Explicit cleanup after every test prevents DOM leaking between tests,
  // which was causing icon-close duplicates and PasswordStrength bleeding through.
  afterEach(() => {
    cleanup();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────
  describe('Rendering', () => {
    it('renders the dialog title when open=true', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      expect(screen.getByRole('heading', { name: /update password/i })).toBeInTheDocument();
    });

    it('does not render dialog content when open=false', () => {
      render(<UpdatePasswordDialog {...buildProps({ open: false })} />);
      expect(screen.queryByRole('heading', { name: /update password/i })).not.toBeInTheDocument();
    });

    it('renders two password inputs', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      expect(screen.getAllByPlaceholderText('********')).toHaveLength(2);
    });

    it('renders the Cancel button', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders the Update Password button', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      expect(getUpdateButton()).toBeInTheDocument();
    });

    it('renders the close icon button', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      expect(screen.getAllByTestId('icon-close')[0]).toBeInTheDocument();
    });

    it('renders New Password and Confirm Password labels', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      expect(screen.getByText('New Password')).toBeInTheDocument();
      expect(screen.getByText('Confirm Password')).toBeInTheDocument();
    });

    it('does not show an error alert on initial render', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not show success alert on initial render', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      expect(screen.queryByText('Password updated successfully.')).not.toBeInTheDocument();
    });
  });

  // ── Confirm button disabled state ──────────────────────────────────────────
  describe('Confirm button disabled state', () => {
    it('is disabled when newPassword is empty', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      expect(getUpdateButton()).toBeDisabled();
    });

    it('is disabled when passwords do not match', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'abc12345' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'xyz99999' } });
      expect(getUpdateButton()).toBeDisabled();
    });

    it('is enabled when newPassword is set and passwords match', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'abc12345' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'abc12345' } });
      expect(getUpdateButton()).not.toBeDisabled();
    });
  });

  // ── Password mismatch UI ───────────────────────────────────────────────────
  describe('Password mismatch UI', () => {
    it('shows mismatch text when passwords differ', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'abc123' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'xyz999' } });
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('does not show mismatch when confirmPassword is empty', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'abc123' } });
      expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
    });

    it('does not show mismatch when passwords match', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'abc123' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'abc123' } });
      expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
    });
  });

  // ── Validation errors from handleConfirm ──────────────────────────────────
  describe('Validation errors on confirm', () => {
    it('shows error when password is fewer than 8 characters', async () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'abc' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'abc' } });
      await act(async () => {
        fireEvent.click(getUpdateButton());
      });
      expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
    });

    it('clears error when user types in newPassword field after a validation error', async () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'short' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'short' } });
      await act(async () => {
        fireEvent.click(getUpdateButton());
      });
      expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
      fireEvent.change(getNewPasswordInput(), { target: { value: 'short2' } });
      expect(screen.queryByText('Password must be at least 8 characters.')).not.toBeInTheDocument();
    });

    it('clears error when user types in confirmPassword field after a validation error', async () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'short' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'short' } });
      await act(async () => {
        fireEvent.click(getUpdateButton());
      });
      expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'short3' } });
      expect(screen.queryByText('Password must be at least 8 characters.')).not.toBeInTheDocument();
    });
  });

  // ── Successful password update ─────────────────────────────────────────────
  describe('Successful password update', () => {
    it('calls onChangePassword with userId and newPassword', async () => {
      const onChangePassword = vi.fn().mockResolvedValue(undefined);
      render(<UpdatePasswordDialog {...buildProps({ onChangePassword })} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'ValidPass1' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'ValidPass1' } });
      await act(async () => {
        fireEvent.click(getUpdateButton());
      });
      expect(onChangePassword).toHaveBeenCalledWith('user-123', 'ValidPass1');
    });

    it('shows success alert after successful update', async () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'ValidPass1' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'ValidPass1' } });
      await act(async () => {
        fireEvent.click(getUpdateButton());
      });
      expect(screen.getByText('Password updated successfully.')).toBeInTheDocument();
    });

    it('calls onClose after 1500ms on success', async () => {
      // Fake timers scoped only to this test
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const onClose = vi.fn();
      render(<UpdatePasswordDialog {...buildProps({ onClose })} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'ValidPass1' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'ValidPass1' } });
      await act(async () => {
        fireEvent.click(getUpdateButton());
      });
      expect(onClose).not.toHaveBeenCalled();
      act(() => { vi.advanceTimersByTime(1500); });
      expect(onClose).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    },10000);

    it('shows "Updating..." label while request is in flight', async () => {
      let resolvePromise!: () => void;
      const pendingPromise = new Promise<void>((res) => { resolvePromise = res; });
      const onChangePassword = vi.fn().mockReturnValue(pendingPromise);
      render(<UpdatePasswordDialog {...buildProps({ onChangePassword })} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'ValidPass1' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'ValidPass1' } });
      // Do not await — keep the promise pending to inspect mid-flight state
      act(() => { fireEvent.click(getUpdateButton()); });
      await waitFor(() => {
        expect(screen.getByText('Updating...')).toBeInTheDocument();
      });
      await act(async () => { resolvePromise(); });
    });

    it('does not call onChangePassword when userId is null', async () => {
      const onChangePassword = vi.fn().mockResolvedValue(undefined);
      render(<UpdatePasswordDialog {...buildProps({ userId: null, onChangePassword })} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'ValidPass12' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'ValidPass12' } });
      await act(async () => {
        fireEvent.click(getUpdateButton());
      });
      expect(onChangePassword).not.toHaveBeenCalled();
    });
  });

  // ── API error handling ─────────────────────────────────────────────────────
  describe('API error handling', () => {
    it('shows error message when onChangePassword rejects with an Error', async () => {
      const onChangePassword = vi.fn().mockRejectedValue(new Error('Server error'));
      render(<UpdatePasswordDialog {...buildProps({ onChangePassword })} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'ValidPass1' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'ValidPass1' } });
      await act(async () => {
        fireEvent.click(getUpdateButton());
      });
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });

    it('shows fallback error when rejection is not an Error instance', async () => {
      const onChangePassword = vi.fn().mockRejectedValue('unknown');
      render(<UpdatePasswordDialog {...buildProps({ onChangePassword })} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'ValidPass1' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'ValidPass1' } });
      await act(async () => {
        fireEvent.click(getUpdateButton());
      });
      expect(screen.getByText('Failed to update password.')).toBeInTheDocument();
    });

    it('shows the error alert after an API error', async () => {
      const onChangePassword = vi.fn().mockRejectedValue(new Error('oops'));
      render(<UpdatePasswordDialog {...buildProps({ onChangePassword })} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'ValidPass1' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'ValidPass1' } });
      await act(async () => {
        fireEvent.click(getUpdateButton());
      });
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('oops')).toBeInTheDocument();
    });
  });

  // ── handleClose ────────────────────────────────────────────────────────────
  describe('handleClose', () => {
    it('calls onClose when Cancel is clicked', () => {
      const onClose = vi.fn();
      render(<UpdatePasswordDialog {...buildProps({ onClose })} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the X button is clicked', () => {
      const onClose = vi.fn();
      render(<UpdatePasswordDialog {...buildProps({ onClose })} />);
      fireEvent.click(getCloseButton());
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose while updatingPassword is true', async () => {
      let resolvePromise!: () => void;
      const pendingPromise = new Promise<void>((res) => { resolvePromise = res; });
      const onChangePassword = vi.fn().mockReturnValue(pendingPromise);
      const onClose = vi.fn();
      render(<UpdatePasswordDialog {...buildProps({ onChangePassword, onClose })} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'ValidPass1' } });
      fireEvent.change(getConfirmPasswordInput(), { target: { value: 'ValidPass1' } });
      act(() => { fireEvent.click(getUpdateButton()); });
      await waitFor(() => {
        expect(screen.getByText('Updating...')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onClose).not.toHaveBeenCalled();
      await act(async () => { resolvePromise(); });
    },10000);
  });

  // ── Password visibility toggle ─────────────────────────────────────────────
  describe('Password visibility toggle', () => {
    it('new password field starts as type="password"', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      expect(getNewPasswordInput()).toHaveAttribute('type', 'password');
    });

    it('confirm password field starts as type="password"', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      expect(getConfirmPasswordInput()).toHaveAttribute('type', 'password');
    });

    it('toggles new password to type="text" then back to "password"', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      const toggleBtn = getNewPasswordToggleButton();
      fireEvent.click(toggleBtn);
      expect(getNewPasswordInput()).toHaveAttribute('type', 'text');
      fireEvent.click(toggleBtn);
      expect(getNewPasswordInput()).toHaveAttribute('type', 'password');
    });
  });

  // ── Focus / blur ───────────────────────────────────────────────────────────
  describe('Focus and blur', () => {
    it('focuses and blurs new password field without error', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      const input = getNewPasswordInput();
      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(input).toBeInTheDocument();
    });

    it('focuses and blurs confirm password field without error', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      const input = getConfirmPasswordInput();
      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(input).toBeInTheDocument();
    });
  });

  // ── PasswordStrength ───────────────────────────────────────────────────────
  describe('PasswordStrength', () => {
    it('does not render strength indicator when newPassword is empty', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      expect(screen.queryByText('At least 8 characters')).not.toBeInTheDocument();
    });

    it('renders all three check labels when newPassword is non-empty', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'a' } });
      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
      expect(screen.getByText('Contains a number')).toBeInTheDocument();
      expect(screen.getByText('Contains a letter')).toBeInTheDocument();
    });

    it('renders strength checks for a fully strong password', () => {
      render(<UpdatePasswordDialog {...buildProps()} />);
      fireEvent.change(getNewPasswordInput(), { target: { value: 'Strong1!' } });
      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
      expect(screen.getByText('Contains a number')).toBeInTheDocument();
      expect(screen.getByText('Contains a letter')).toBeInTheDocument();
    });
  });
});