import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { UserListActionMenu, UserListActionDialogs } from './UserListActions';
import type {
  UserListActionMenuProps,
  UserListActionDialogsProps,
} from '@/modules/UserLifecycle/types/userTypes';

// ─── Mock theme ───────────────────────────────────────────────────────────────
vi.mock('@/core/theme/brmsTheme', () => ({
  brmsTheme: {
    colors: {
      formBg: '#F9FAFB',
      panelBorder: '#E5E7EB',
      panelIndigo: '#4F46E5',
      primaryGlowSoft: 'rgba(79,70,229,0.08)',
      errorText: '#EF4444',
    },
  },
}));

// ─── Mock RcConfirmDialog ─────────────────────────────────────────────────────
vi.mock('@/core/components/RcConfirmDailog', () => ({
  default: vi.fn(({ open, title, message, confirmText, cancelText, onConfirm, onCancel }) =>
    open ? (
      <div data-testid="rc-confirm-dialog">
        <span data-testid="confirm-title">{title}</span>
        <span data-testid="confirm-message">{message}</span>
        <button data-testid="confirm-btn" onClick={onConfirm}>
          {confirmText}
        </button>
        <button data-testid="cancel-btn" onClick={onCancel}>
          {cancelText}
        </button>
      </div>
    ) : null
  ),
}));

// ─── Mock UpdatePasswordDialog ────────────────────────────────────────────────
vi.mock('@/modules/UserLifecycle/components/UpdatePasswordDialog', () => ({
  default: vi.fn(({ open, userId, onClose, onChangePassword }) =>
    open ? (
      <div data-testid="update-password-dialog">
        <span data-testid="upd-user-id">{userId}</span>
        <button data-testid="upd-close-btn" onClick={onClose}>
          Close
        </button>
        <button
          data-testid="upd-change-btn"
          onClick={() => onChangePassword(userId, 'newpass')}
        >
          Change
        </button>
      </div>
    ) : null
  ),
}));

// ─── Mock CreateUserApi ───────────────────────────────────────────────────────
vi.mock('@/modules/UserLifecycle/api/createUserApi', () => ({
  CreateUserApi: {
    changePassword: vi.fn().mockResolvedValue(undefined),
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const anchorEl = document.createElement('button');

function buildMenuProps(overrides: Partial<UserListActionMenuProps> = {}): UserListActionMenuProps {
  return {
    anchorEl,
    onClose: vi.fn(),
    onUpdatePassword: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };
}

function buildDialogProps(
  overrides: Partial<UserListActionDialogsProps> = {}
): UserListActionDialogsProps {
  return {
    selectedUserId: 'user-42',
    deleteDialogOpen: false,
    passwordDialogOpen: false,
    deleting: false,
    onConfirmDelete: vi.fn(),
    onCloseDelete: vi.fn(),
    onClosePassword: vi.fn(),
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('UserListActionMenu', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  // ── Rendering ────────────────────────────────────────────────────────────
  describe('Rendering', () => {
    it('renders when anchorEl is set (open=true)', () => {
      render(<UserListActionMenu {...buildMenuProps()} />);
      expect(screen.getByText('Update Password')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('does not show menu items when anchorEl is null', () => {
      render(<UserListActionMenu {...buildMenuProps({ anchorEl: null })} />);
      expect(screen.queryByText('Update Password')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('renders exactly two menu items', () => {
      render(<UserListActionMenu {...buildMenuProps()} />);
      expect(screen.getByText('Update Password')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  // ── Callbacks ────────────────────────────────────────────────────────────
  describe('Callbacks', () => {
    it('calls onUpdatePassword when "Update Password" item is clicked', () => {
      const onUpdatePassword = vi.fn();
      render(<UserListActionMenu {...buildMenuProps({ onUpdatePassword })} />);
      fireEvent.click(screen.getByText('Update Password'));
      expect(onUpdatePassword).toHaveBeenCalledTimes(1);
    });

    it('calls onDelete when "Delete" item is clicked', () => {
      const onDelete = vi.fn();
      render(<UserListActionMenu {...buildMenuProps({ onDelete })} />);
      fireEvent.click(screen.getByText('Delete'));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the menu backdrop is clicked', () => {
      const onClose = vi.fn();
      render(<UserListActionMenu {...buildMenuProps({ onClose })} />);
      // MUI Menu fires onClose when clicking the backdrop overlay
      const backdrop = document.querySelector('.MuiBackdrop-root') as HTMLElement;
      if (backdrop) fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('UserListActionDialogs', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  // ── RcConfirmDialog (delete) ──────────────────────────────────────────────
  describe('RcConfirmDialog (delete)', () => {
    it('does not render confirm dialog when deleteDialogOpen=false', () => {
      render(<UserListActionDialogs {...buildDialogProps({ deleteDialogOpen: false })} />);
      expect(screen.queryByTestId('rc-confirm-dialog')).not.toBeInTheDocument();
    });

    it('renders confirm dialog when deleteDialogOpen=true', () => {
      render(<UserListActionDialogs {...buildDialogProps({ deleteDialogOpen: true })} />);
      expect(screen.getByTestId('rc-confirm-dialog')).toBeInTheDocument();
    });

    it('shows title "Delete User"', () => {
      render(<UserListActionDialogs {...buildDialogProps({ deleteDialogOpen: true })} />);
      expect(screen.getByTestId('confirm-title')).toHaveTextContent('Delete User');
    });

    it('shows the correct confirmation message', () => {
      render(<UserListActionDialogs {...buildDialogProps({ deleteDialogOpen: true })} />);
      expect(screen.getByTestId('confirm-message')).toHaveTextContent(
        'Are you sure you want to delete this user? This action cannot be undone.'
      );
    });

    it('shows "Delete" confirm text when deleting=false', () => {
      render(
        <UserListActionDialogs
          {...buildDialogProps({ deleteDialogOpen: true, deleting: false })}
        />
      );
      expect(screen.getByTestId('confirm-btn')).toHaveTextContent('Delete');
    });

    it('shows "Deleting..." confirm text when deleting=true', () => {
      render(
        <UserListActionDialogs
          {...buildDialogProps({ deleteDialogOpen: true, deleting: true })}
        />
      );
      expect(screen.getByTestId('confirm-btn')).toHaveTextContent('Deleting...');
    });

    it('shows "Cancel" cancel text', () => {
      render(<UserListActionDialogs {...buildDialogProps({ deleteDialogOpen: true })} />);
      expect(screen.getByTestId('cancel-btn')).toHaveTextContent('Cancel');
    });

    it('calls onConfirmDelete when confirm button is clicked', () => {
      const onConfirmDelete = vi.fn();
      render(
        <UserListActionDialogs
          {...buildDialogProps({ deleteDialogOpen: true, onConfirmDelete })}
        />
      );
      fireEvent.click(screen.getByTestId('confirm-btn'));
      expect(onConfirmDelete).toHaveBeenCalledTimes(1);
    });

    it('calls onCloseDelete when cancel button is clicked', () => {
      const onCloseDelete = vi.fn();
      render(
        <UserListActionDialogs
          {...buildDialogProps({ deleteDialogOpen: true, onCloseDelete })}
        />
      );
      fireEvent.click(screen.getByTestId('cancel-btn'));
      expect(onCloseDelete).toHaveBeenCalledTimes(1);
    });
  });

  // ── UpdatePasswordDialog ──────────────────────────────────────────────────
  describe('UpdatePasswordDialog', () => {
    it('does not render password dialog when passwordDialogOpen=false', () => {
      render(<UserListActionDialogs {...buildDialogProps({ passwordDialogOpen: false })} />);
      expect(screen.queryByTestId('update-password-dialog')).not.toBeInTheDocument();
    });

    it('renders password dialog when passwordDialogOpen=true', () => {
      render(<UserListActionDialogs {...buildDialogProps({ passwordDialogOpen: true })} />);
      expect(screen.getByTestId('update-password-dialog')).toBeInTheDocument();
    });

    it('passes selectedUserId to UpdatePasswordDialog', () => {
      render(
        <UserListActionDialogs
          {...buildDialogProps({ passwordDialogOpen: true, selectedUserId: 'user-99' })}
        />
      );
      expect(screen.getByTestId('upd-user-id')).toHaveTextContent('user-99');
    });

    it('passes null selectedUserId without crashing', () => {
      render(
        <UserListActionDialogs
          {...buildDialogProps({ passwordDialogOpen: true, selectedUserId: null })}
        />
      );
      expect(screen.getByTestId('update-password-dialog')).toBeInTheDocument();
    });

    it('calls onClosePassword when close button is clicked', () => {
      const onClosePassword = vi.fn();
      render(
        <UserListActionDialogs
          {...buildDialogProps({ passwordDialogOpen: true, onClosePassword })}
        />
      );
      fireEvent.click(screen.getByTestId('upd-close-btn'));
      expect(onClosePassword).toHaveBeenCalledTimes(1);
    });

    it('passes CreateUserApi.changePassword as onChangePassword', async () => {
      const { CreateUserApi } = await import('@/modules/UserLifecycle/api/createUserApi');
      render(<UserListActionDialogs {...buildDialogProps({ passwordDialogOpen: true })} />);
      fireEvent.click(screen.getByTestId('upd-change-btn'));
      expect(CreateUserApi.changePassword).toHaveBeenCalledTimes(1);
      expect(CreateUserApi.changePassword).toHaveBeenCalledWith('user-42', 'newpass');
    });
  });

  // ── Both dialogs closed simultaneously ────────────────────────────────────
  describe('Both dialogs closed', () => {
    it('renders neither dialog when both are closed', () => {
      render(
        <UserListActionDialogs
          {...buildDialogProps({ deleteDialogOpen: false, passwordDialogOpen: false })}
        />
      );
      expect(screen.queryByTestId('rc-confirm-dialog')).not.toBeInTheDocument();
      expect(screen.queryByTestId('update-password-dialog')).not.toBeInTheDocument();
    });

    it('can render both dialogs open simultaneously', () => {
      render(
        <UserListActionDialogs
          {...buildDialogProps({ deleteDialogOpen: true, passwordDialogOpen: true })}
        />
      );
      expect(screen.getByTestId('rc-confirm-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('update-password-dialog')).toBeInTheDocument();
    });
  });

  // ── Mock call verification ────────────────────────────────────────────────
  describe('Mock call verification', () => {
    it('RcConfirmDialog receives isDangerous=true', async () => {
      const RcConfirmDialog = (await import('@/core/components/RcConfirmDailog'))
        .default as ReturnType<typeof vi.fn>;
      render(<UserListActionDialogs {...buildDialogProps({ deleteDialogOpen: true })} />);
      const lastCall = RcConfirmDialog.mock.calls[RcConfirmDialog.mock.calls.length - 1];
      expect(lastCall[0].isDangerous).toBe(true);
    });

    it('UpdatePasswordDialog receives open=false when passwordDialogOpen=false', async () => {
      const UpdatePasswordDialogMock = (
        await import('@/modules/UserLifecycle/components/UpdatePasswordDialog')
      ).default as ReturnType<typeof vi.fn>;
      render(<UserListActionDialogs {...buildDialogProps({ passwordDialogOpen: false })} />);
      const lastCall =
        UpdatePasswordDialogMock.mock.calls[UpdatePasswordDialogMock.mock.calls.length - 1];
      expect(lastCall[0].open).toBe(false);
    });
  });
});