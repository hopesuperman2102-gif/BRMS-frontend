import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import React from 'react';
import UserListCard from './UserListCard';
import type { UserManagementResponse } from '@/modules/UserLifecycle/types/userEndpointsTypes';

// ─── Mock theme ───────────────────────────────────────────────────────────────
vi.mock('@/core/theme/brmsTheme', () => ({
  brmsTheme: {
    colors: {
      textOnPrimary: '#111827',
      panelTextMid: '#6B7280',
    },
  },
}));

// ─── Mock useUsers ────────────────────────────────────────────────────────────
const mockFetchUsers = vi.fn().mockResolvedValue(undefined);
const mockDeleteUserById = vi.fn().mockResolvedValue(undefined);
const mockUseUsers = vi.fn();

vi.mock('@/modules/UserLifecycle/hooks/useUsers', () => ({
  useUsers: (...args: unknown[]) => mockUseUsers(...args),
}));

// ─── Mock UserListTable ───────────────────────────────────────────────────────
vi.mock('@/modules/UserLifecycle/components/UserListTable', () => ({
  default: vi.fn(({ users, loading, error, onRetry, onOpenMenu }) => (
    <div data-testid="user-list-table">
      {loading && <span data-testid="table-loading">Loading...</span>}
      {error && <span data-testid="table-error">{error}</span>}
      {!loading && !error && (
        <ul>
          {users.map((u: UserManagementResponse) => (
            <li key={u.id}>
              <span>{u.username}</span>
              <button
                data-testid={`menu-btn-${u.id}`}
                onClick={(e) => onOpenMenu(e, u.id)}
              >
                Open Menu
              </button>
            </li>
          ))}
        </ul>
      )}
      <button data-testid="retry-btn" onClick={onRetry}>
        Retry
      </button>
    </div>
  )),
}));

// ─── Captured dialog callbacks — updated on every render ─────────────────────
// This lets tests call onConfirmDelete/onCloseDelete/onClosePassword directly,
// which is the only reliable way to exercise branches like the !selectedUserId guard.
let capturedOnConfirmDelete: () => void = () => {};
let capturedOnCloseDelete: () => void = () => {};
let capturedOnClosePassword: () => void = () => {};

vi.mock('@/modules/UserLifecycle/components/UserListActions', () => ({
  UserListActionMenu: vi.fn(({ anchorEl, onClose, onUpdatePassword, onDelete }) => (
    <div data-testid="action-menu" data-open={Boolean(anchorEl)}>
      <button data-testid="menu-close" onClick={onClose}>
        Close
      </button>
      <button data-testid="menu-update-password" onClick={onUpdatePassword}>
        Update Password
      </button>
      <button data-testid="menu-delete" onClick={onDelete}>
        Delete
      </button>
    </div>
  )),
  UserListActionDialogs: vi.fn(
    ({
      selectedUserId,
      deleteDialogOpen,
      passwordDialogOpen,
      deleting,
      onConfirmDelete,
      onCloseDelete,
      onClosePassword,
    }) => {
      // Always capture latest callbacks so tests can call them directly
      capturedOnConfirmDelete = onConfirmDelete;
      capturedOnCloseDelete = onCloseDelete;
      capturedOnClosePassword = onClosePassword;
      return (
        <div data-testid="action-dialogs">
          <span data-testid="dialogs-selected-user">{selectedUserId ?? ''}</span>
          <span data-testid="dialogs-deleting">{deleting ? 'true' : 'false'}</span>
          <span data-testid="dialogs-delete-open">{deleteDialogOpen ? 'true' : 'false'}</span>
          <span data-testid="dialogs-password-open">{passwordDialogOpen ? 'true' : 'false'}</span>
          {deleteDialogOpen && (
            <div data-testid="delete-dialog">
              <span data-testid="delete-user-id">{selectedUserId}</span>
              <span data-testid="deleting-state">{deleting ? 'true' : 'false'}</span>
              <button data-testid="confirm-delete-btn" onClick={onConfirmDelete}>
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button data-testid="close-delete-btn" onClick={onCloseDelete}>
                Cancel
              </button>
            </div>
          )}
          {passwordDialogOpen && (
            <div data-testid="password-dialog">
              <span data-testid="password-user-id">{selectedUserId}</span>
              <button data-testid="close-password-btn" onClick={onClosePassword}>
                Close
              </button>
            </div>
          )}
          {/* Always-visible confirm trigger for testing the !selectedUserId guard */}
          <button data-testid="direct-confirm-btn" onClick={onConfirmDelete}>
            Direct Confirm
          </button>
        </div>
      );
    }
  ),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const mockUsers: UserManagementResponse[] = [
  {
    id: 'user-1',
    username: 'alice',
    email: 'alice@test.com',
    roles: ['VIEWER'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    username: 'bob',
    email: 'bob@test.com',
    roles: ['ADMIN'],
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
];

const defaultUseUsersReturn = {
  users: mockUsers,
  loading: false,
  error: null,
  fetchUsers: mockFetchUsers,
  deleteUserById: mockDeleteUserById,
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('UserListCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUsers.mockReturnValue(defaultUseUsersReturn);
    capturedOnConfirmDelete = () => {};
    capturedOnCloseDelete = () => {};
    capturedOnClosePassword = () => {};
  });

  afterEach(() => {
    cleanup();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<UserListCard />);
      expect(screen.getByTestId('user-list-table')).toBeInTheDocument();
    });

    it('renders the "Team Members" heading', () => {
      render(<UserListCard />);
      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });

    it('renders the subtitle text', () => {
      render(<UserListCard />);
      expect(
        screen.getByText(/Manage users, roles, and access permissions/i)
      ).toBeInTheDocument();
    });

    it('renders UserListTable with users from useUsers', () => {
      render(<UserListCard />);
      expect(screen.getByText('alice')).toBeInTheDocument();
      expect(screen.getByText('bob')).toBeInTheDocument();
    });

    it('renders UserListActionMenu and UserListActionDialogs', () => {
      render(<UserListCard />);
      expect(screen.getByTestId('action-menu')).toBeInTheDocument();
      expect(screen.getByTestId('action-dialogs')).toBeInTheDocument();
    });

    it('passes loading=true to UserListTable when useUsers returns loading', () => {
      mockUseUsers.mockReturnValue({ ...defaultUseUsersReturn, loading: true, users: [] });
      render(<UserListCard />);
      expect(screen.getByTestId('table-loading')).toBeInTheDocument();
    });

    it('passes error to UserListTable when useUsers returns an error', () => {
      mockUseUsers.mockReturnValue({
        ...defaultUseUsersReturn,
        error: 'Network failure',
        users: [],
      });
      render(<UserListCard />);
      expect(screen.getByTestId('table-error')).toHaveTextContent('Network failure');
    });

    it('initial dialog states are all false / null', () => {
      render(<UserListCard />);
      expect(screen.getByTestId('dialogs-delete-open')).toHaveTextContent('false');
      expect(screen.getByTestId('dialogs-password-open')).toHaveTextContent('false');
      expect(screen.getByTestId('dialogs-deleting')).toHaveTextContent('false');
      expect(screen.getByTestId('dialogs-selected-user')).toHaveTextContent('');
    });
  });

  // ── useUsers integration ───────────────────────────────────────────────────
  describe('useUsers integration', () => {
    it('calls useUsers with undefined when no newUser prop is given', () => {
      render(<UserListCard />);
      expect(mockUseUsers).toHaveBeenCalledWith(undefined);
    });

    it('calls useUsers with newUser when prop is provided', () => {
      const newUser = mockUsers[0];
      render(<UserListCard newUser={newUser} />);
      expect(mockUseUsers).toHaveBeenCalledWith(newUser);
    });

    it('calls useUsers with null when newUser=null', () => {
      render(<UserListCard newUser={null} />);
      expect(mockUseUsers).toHaveBeenCalledWith(null);
    });

    it('calls fetchUsers when Retry button is clicked', async () => {
      render(<UserListCard />);
      await act(async () => {
        fireEvent.click(screen.getByTestId('retry-btn'));
      });
      expect(mockFetchUsers).toHaveBeenCalledTimes(1);
    });
  });

  // ── Menu open/close ────────────────────────────────────────────────────────
  describe('Menu open / close', () => {
    it('menu starts closed (anchorEl=null)', () => {
      render(<UserListCard />);
      expect(screen.getByTestId('action-menu')).toHaveAttribute('data-open', 'false');
    });

    it('opens menu when onOpenMenu is called from UserListTable', () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      expect(screen.getByTestId('action-menu')).toHaveAttribute('data-open', 'true');
    });

    it('sets selectedUserId when menu is opened for a user', () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-2'));
      expect(screen.getByTestId('dialogs-selected-user')).toHaveTextContent('user-2');
    });

    it('closes menu when onClose is called', () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-close'));
      expect(screen.getByTestId('action-menu')).toHaveAttribute('data-open', 'false');
    });

    it('handleMenuOpen calls stopPropagation on the event', async () => {
      const { default: UserListTable } = await import(
        '@/modules/UserLifecycle/components/UserListTable'
      );
      const mocked = vi.mocked(UserListTable);
      render(<UserListCard />);
      const stopPropagation = vi.fn();
      const btn = screen.getByTestId('menu-btn-user-1');
      const { onOpenMenu } = mocked.mock.calls[mocked.mock.calls.length - 1][0];
      const fakeEvent = {
        currentTarget: btn,
        stopPropagation,
      } as unknown as React.MouseEvent<HTMLElement>;
      act(() => { onOpenMenu(fakeEvent, 'user-1'); });
      expect(stopPropagation).toHaveBeenCalledTimes(1);
    });
  });

  // ── Delete flow ────────────────────────────────────────────────────────────
  describe('Delete flow', () => {
    it('opens delete dialog when "Delete" is clicked in menu', () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-delete'));
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });

    it('closes menu when delete is clicked', () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-delete'));
      expect(screen.getByTestId('action-menu')).toHaveAttribute('data-open', 'false');
    });

    it('calls deleteUserById with selectedUserId on confirm', async () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-delete'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete-btn'));
      });
      expect(mockDeleteUserById).toHaveBeenCalledWith('user-1');
    });

    it('closes delete dialog after successful deletion', async () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-delete'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete-btn'));
      });
      expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
    });

    it('clears selectedUserId after successful deletion', async () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-delete'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete-btn'));
      });
      expect(screen.getByTestId('dialogs-selected-user')).toHaveTextContent('');
    });

    it('does NOT call deleteUserById when selectedUserId is null (early return guard)', async () => {
      render(<UserListCard />);
      // selectedUserId is null on initial render — fire confirm directly via captured callback
      await act(async () => {
        capturedOnConfirmDelete();
      });
      expect(mockDeleteUserById).not.toHaveBeenCalled();
    });

    it('sets deleting=true while deletion is in flight', async () => {
      let resolveDelete!: () => void;
      mockDeleteUserById.mockReturnValueOnce(
        new Promise<void>((res) => { resolveDelete = res; })
      );
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-delete'));
      // Don't await — inspect mid-flight state
      act(() => { fireEvent.click(screen.getByTestId('confirm-delete-btn')); });
      expect(screen.getByTestId('dialogs-deleting')).toHaveTextContent('true');
      await act(async () => { resolveDelete(); });
    });

    it('resets deleting=false after successful deletion', async () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-delete'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete-btn'));
      });
      expect(screen.getByTestId('dialogs-deleting')).toHaveTextContent('false');
    });

    it('closes delete dialog when cancel is clicked', () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-delete'));
      fireEvent.click(screen.getByTestId('close-delete-btn'));
      expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
    });

    it('keeps delete dialog open when deleteUserById rejects', async () => {
      mockDeleteUserById.mockRejectedValueOnce(new Error('Delete failed'));
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-delete'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete-btn'));
      });
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });

    it('resets deleting=false after rejection', async () => {
      mockDeleteUserById.mockRejectedValueOnce(new Error('fail'));
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-delete'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete-btn'));
      });
      expect(screen.getByTestId('dialogs-deleting')).toHaveTextContent('false');
    });

    it('onCloseDelete sets deleteDialogOpen to false via captured callback', () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-delete'));
      expect(screen.getByTestId('dialogs-delete-open')).toHaveTextContent('true');
      act(() => { capturedOnCloseDelete(); });
      expect(screen.getByTestId('dialogs-delete-open')).toHaveTextContent('false');
    });
  });

  // ── Update password flow ───────────────────────────────────────────────────
  describe('Update password flow', () => {
    it('opens password dialog when "Update Password" is clicked in menu', () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-update-password'));
      expect(screen.getByTestId('password-dialog')).toBeInTheDocument();
    });

    it('closes menu when Update Password is clicked', () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-update-password'));
      expect(screen.getByTestId('action-menu')).toHaveAttribute('data-open', 'false');
    });

    it('passes selectedUserId to the password dialog', () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-2'));
      fireEvent.click(screen.getByTestId('menu-update-password'));
      expect(screen.getByTestId('password-user-id')).toHaveTextContent('user-2');
    });

    it('closes password dialog when onClosePassword is called', () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-update-password'));
      fireEvent.click(screen.getByTestId('close-password-btn'));
      expect(screen.queryByTestId('password-dialog')).not.toBeInTheDocument();
    });

    it('onClosePassword sets passwordDialogOpen to false via captured callback', () => {
      render(<UserListCard />);
      fireEvent.click(screen.getByTestId('menu-btn-user-1'));
      fireEvent.click(screen.getByTestId('menu-update-password'));
      expect(screen.getByTestId('dialogs-password-open')).toHaveTextContent('true');
      act(() => { capturedOnClosePassword(); });
      expect(screen.getByTestId('dialogs-password-open')).toHaveTextContent('false');
    });
  });

  // ── Mock call verification ─────────────────────────────────────────────────
  describe('Mock call verification', () => {
    it('UserListTable receives correct props on initial render', async () => {
      const UserListTable = (
        await import('@/modules/UserLifecycle/components/UserListTable')
      ).default;
      const mocked = vi.mocked(UserListTable);
      render(<UserListCard />);
      const lastCall = mocked.mock.calls[mocked.mock.calls.length - 1];
      expect(lastCall[0].users).toEqual(mockUsers);
      expect(lastCall[0].loading).toBe(false);
      expect(lastCall[0].error).toBeNull();
      expect(typeof lastCall[0].onRetry).toBe('function');
      expect(typeof lastCall[0].onOpenMenu).toBe('function');
    });

    it('UserListActionMenu receives correct initial props', async () => {
      const { UserListActionMenu } = await import(
        '@/modules/UserLifecycle/components/UserListActions'
      );
      const mocked = vi.mocked(UserListActionMenu);
      render(<UserListCard />);
      const lastCall = mocked.mock.calls[mocked.mock.calls.length - 1];
      expect(lastCall[0].anchorEl).toBeNull();
      expect(typeof lastCall[0].onClose).toBe('function');
      expect(typeof lastCall[0].onUpdatePassword).toBe('function');
      expect(typeof lastCall[0].onDelete).toBe('function');
    });

    it('UserListActionDialogs receives correct initial props', async () => {
      const { UserListActionDialogs } = await import(
        '@/modules/UserLifecycle/components/UserListActions'
      );
      const mocked = vi.mocked(UserListActionDialogs);
      render(<UserListCard />);
      const lastCall = mocked.mock.calls[mocked.mock.calls.length - 1];
      expect(lastCall[0].selectedUserId).toBeNull();
      expect(lastCall[0].deleteDialogOpen).toBe(false);
      expect(lastCall[0].passwordDialogOpen).toBe(false);
      expect(lastCall[0].deleting).toBe(false);
      expect(typeof lastCall[0].onConfirmDelete).toBe('function');
      expect(typeof lastCall[0].onCloseDelete).toBe('function');
      expect(typeof lastCall[0].onClosePassword).toBe('function');
    });
  });
});