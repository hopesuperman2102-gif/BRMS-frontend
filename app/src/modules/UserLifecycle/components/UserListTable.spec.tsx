import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import UserListTable from './UserListTable';
import type { User } from '@/modules/UserLifecycle/types/userTypes';

// ─── Mock theme ───────────────────────────────────────────────────────────────
vi.mock('@/core/theme/brmsTheme', () => ({
  brmsTheme: {
    colors: {
      white: '#ffffff',
      panelIndigo: '#4F46E5',
      panelTextLow: '#9CA3AF',
    },
  },
}));

// ─── Mock MUI icons ───────────────────────────────────────────────────────────
vi.mock('@mui/icons-material/MoreVert', () => ({
  default: () => <span data-testid="more-vert-icon" />,
}));

// ─── Mock RcTable ─────────────────────────────────────────────────────────────
vi.mock('@/core/components/RcTable', () => ({
  default: vi.fn(({ headers, rows, onRowClick }) => (
    <div data-testid="rc-table">
      <div data-testid="rc-table-headers">
        {headers.map((h: string) => (
          <span key={h} data-testid={`header-${h}`}>
            {h}
          </span>
        ))}
      </div>
      <div data-testid="rc-table-rows">
        {rows.map((row: Record<string, React.ReactNode>, i: number) => (
          <div key={i} data-testid={`row-${i}`} onClick={() => onRowClick?.(row, i)}>
            <span data-testid={`row-${i}-username`}>{row['Username']}</span>
            <span data-testid={`row-${i}-email`}>{row['Email']}</span>
            <span data-testid={`row-${i}-role`}>{row['Role']}</span>
            <span data-testid={`row-${i}-actions`}>{row['Actions']}</span>
          </div>
        ))}
      </div>
    </div>
  )),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'alice',
    email: 'alice@test.com',
    roles: ['VIEWER'],
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    username: 'bob',
    email: 'bob@test.com',
    roles: ['RULE_AUTHOR', 'REVIEWER'],
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'user-3',
    username: 'carol',
    email: 'carol@test.com',
    roles: [],
    created_at: '2024-03-01T00:00:00Z',
  },
];

function buildProps(overrides: Partial<React.ComponentProps<typeof UserListTable>> = {}) {
  return {
    users: mockUsers,
    loading: false,
    error: '',
    onRetry: vi.fn(),
    onOpenMenu: vi.fn(),
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('UserListTable', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  // ── Loading state ──────────────────────────────────────────────────────────
  describe('Loading state', () => {
    it('renders a CircularProgress when loading=true', () => {
      render(<UserListTable {...buildProps({ loading: true, users: [] })} />);
      // CircularProgress renders an svg role="progressbar"
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not render RcTable when loading=true', () => {
      render(<UserListTable {...buildProps({ loading: true, users: [] })} />);
      expect(screen.queryByTestId('rc-table')).not.toBeInTheDocument();
    });

    it('does not render error UI when loading=true', () => {
      render(<UserListTable {...buildProps({ loading: true, error: 'Some error', users: [] })} />);
      expect(screen.queryByText('Some error')).not.toBeInTheDocument();
    });
  });

  // ── Error state ────────────────────────────────────────────────────────────
  describe('Error state', () => {
    it('renders the error message when error is non-empty', () => {
      render(<UserListTable {...buildProps({ error: 'Network failure', users: [] })} />);
      expect(screen.getByText('Network failure')).toBeInTheDocument();
    });

    it('renders a Retry button when error is non-empty', () => {
      render(<UserListTable {...buildProps({ error: 'Oops', users: [] })} />);
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    it('calls onRetry when Retry button is clicked', () => {
      const onRetry = vi.fn();
      render(<UserListTable {...buildProps({ error: 'Oops', users: [], onRetry })} />);
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not render RcTable when error is non-empty', () => {
      render(<UserListTable {...buildProps({ error: 'Oops', users: [] })} />);
      expect(screen.queryByTestId('rc-table')).not.toBeInTheDocument();
    });

    it('does not render loading spinner when error is non-empty', () => {
      render(<UserListTable {...buildProps({ error: 'Oops', users: [] })} />);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  // ── Empty state ────────────────────────────────────────────────────────────
  describe('Empty state', () => {
    it('renders "No users created yet" when users array is empty', () => {
      render(<UserListTable {...buildProps({ users: [] })} />);
      expect(screen.getByText('No users created yet')).toBeInTheDocument();
    });

    it('does not render RcTable when users array is empty', () => {
      render(<UserListTable {...buildProps({ users: [] })} />);
      expect(screen.queryByTestId('rc-table')).not.toBeInTheDocument();
    });

    it('does not render loading or error UI in empty state', () => {
      render(<UserListTable {...buildProps({ users: [] })} />);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    });
  });

  // ── Table rendering ────────────────────────────────────────────────────────
  describe('Table rendering', () => {
    it('renders RcTable when users are present', () => {
      render(<UserListTable {...buildProps()} />);
      expect(screen.getByTestId('rc-table')).toBeInTheDocument();
    });

    it('passes correct headers to RcTable', () => {
      render(<UserListTable {...buildProps()} />);
      expect(screen.getByTestId('header-Username')).toBeInTheDocument();
      expect(screen.getByTestId('header-Email')).toBeInTheDocument();
      expect(screen.getByTestId('header-Role')).toBeInTheDocument();
      expect(screen.getByTestId('header-Actions')).toBeInTheDocument();
    });

    it('renders a row for each user', () => {
      render(<UserListTable {...buildProps()} />);
      expect(screen.getByTestId('row-0')).toBeInTheDocument();
      expect(screen.getByTestId('row-1')).toBeInTheDocument();
      expect(screen.getByTestId('row-2')).toBeInTheDocument();
    });

    it('renders correct username in each row', () => {
      render(<UserListTable {...buildProps()} />);
      expect(screen.getByTestId('row-0-username')).toHaveTextContent('alice');
      expect(screen.getByTestId('row-1-username')).toHaveTextContent('bob');
    });

    it('renders correct email in each row', () => {
      render(<UserListTable {...buildProps()} />);
      expect(screen.getByTestId('row-0-email')).toHaveTextContent('alice@test.com');
      expect(screen.getByTestId('row-1-email')).toHaveTextContent('bob@test.com');
    });

    it('passes an onRowClick function to RcTable', async () => {
      const RcTable = (await import('@/core/components/RcTable')).default;
      const mocked = vi.mocked(RcTable);
      render(<UserListTable {...buildProps()} />);
      const lastCall = mocked.mock.calls[mocked.mock.calls.length - 1];
      expect(typeof lastCall[0].onRowClick).toBe('function');
    });

    it('onRowClick is a no-op (does not throw)', async () => {
      const RcTable = (await import('@/core/components/RcTable')).default;
      const mocked = vi.mocked(RcTable);
      render(<UserListTable {...buildProps()} />);
      const { onRowClick } = mocked.mock.calls[mocked.mock.calls.length - 1][0];
      expect(() => fireEvent.click(screen.getByTestId('row-0'))).not.toThrow();
      expect(() => onRowClick?.({}, 0)).not.toThrow();
    });
  });

  // ── formatRoles ────────────────────────────────────────────────────────────
  describe('formatRoles', () => {
    it('renders a single role with underscore replaced by space', () => {
      render(<UserListTable {...buildProps()} />);
      expect(screen.getByTestId('row-0-role')).toHaveTextContent('VIEWER');
    });

    it('joins multiple roles with ", " and replaces underscores', () => {
      render(<UserListTable {...buildProps()} />);
      expect(screen.getByTestId('row-1-role')).toHaveTextContent('RULE AUTHOR, REVIEWER');
    });

    it('renders an empty string for an empty roles array', () => {
      render(<UserListTable {...buildProps()} />);
      // user-3 has roles: [] — map+join produces "", not "-"
      expect(screen.getByTestId('row-2-role')).toHaveTextContent('');
    });

    it('renders "-" when roles is undefined', () => {
      const usersWithUndefinedRoles: User[] = [
        {
          id: 'user-x',
          username: 'xuser',
          email: 'x@test.com',
          roles: undefined as unknown as string[],
          created_at: '2024-01-01T00:00:00Z',
        },
      ];
      render(<UserListTable {...buildProps({ users: usersWithUndefinedRoles })} />);
      expect(screen.getByTestId('row-0-role')).toHaveTextContent('-');
    });

    it('renders "-" when roles is not an array', () => {
      const usersWithBadRoles: User[] = [
        {
          id: 'user-y',
          username: 'yuser',
          email: 'y@test.com',
          roles: 'ADMIN' as unknown as string[],
          created_at: '2024-01-01T00:00:00Z',
        },
      ];
      render(<UserListTable {...buildProps({ users: usersWithBadRoles })} />);
      expect(screen.getByTestId('row-0-role')).toHaveTextContent('-');
    });
  });

  // ── Actions column ─────────────────────────────────────────────────────────
  describe('Actions column', () => {
    it('renders an actions button in each row', () => {
      render(<UserListTable {...buildProps()} />);
      expect(screen.getAllByTestId('more-vert-icon')).toHaveLength(mockUsers.length);
    });

    it('calls onOpenMenu with event and userId when actions button is clicked', () => {
      const onOpenMenu = vi.fn();
      render(<UserListTable {...buildProps({ onOpenMenu })} />);
      // The ActionsButton for row-0 contains the MoreVertIcon
      const actionIcons = screen.getAllByTestId('more-vert-icon');
      fireEvent.click(actionIcons[0].closest('button')!);
      expect(onOpenMenu).toHaveBeenCalledTimes(1);
      expect(onOpenMenu).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        'user-1'
      );
    });

    it('calls onOpenMenu with correct userId for second row', () => {
      const onOpenMenu = vi.fn();
      render(<UserListTable {...buildProps({ onOpenMenu })} />);
      const actionIcons = screen.getAllByTestId('more-vert-icon');
      fireEvent.click(actionIcons[1].closest('button')!);
      expect(onOpenMenu).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        'user-2'
      );
    });

    it('calls onOpenMenu independently for each row', () => {
      const onOpenMenu = vi.fn();
      render(<UserListTable {...buildProps({ onOpenMenu })} />);
      const actionIcons = screen.getAllByTestId('more-vert-icon');
      actionIcons.forEach((icon) => fireEvent.click(icon.closest('button')!));
      expect(onOpenMenu).toHaveBeenCalledTimes(mockUsers.length);
    });
  });
});