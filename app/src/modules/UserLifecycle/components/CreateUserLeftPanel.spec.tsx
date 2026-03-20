import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CreateUserLeftPanel from './CreateUserLeftPanel';
import type { UserManagementResponse } from '@/modules/UserLifecycle/types/userEndpointsTypes';

// ─── Mock react-router-dom ────────────────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ─── Mock child components ────────────────────────────────────────────────────
vi.mock('@/core/components/RcLeftPanel', () => ({
  default: vi.fn(({ variant, backLabel, onBack, width, children }) => (
    <div
      data-testid="rc-left-panel"
      data-variant={variant}
      data-back-label={backLabel}
      data-width={width}
    >
      <button data-testid="back-button" onClick={onBack}>
        {backLabel}
      </button>
      {children}
    </div>
  )),
}));

vi.mock('@/modules/UserLifecycle/components/UserListCard', () => ({
  default: vi.fn(({ newUser }) => (
    <div
      data-testid="user-list-card"
      data-new-user={JSON.stringify(newUser ?? null)}
    />
  )),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const mockNewUser: UserManagementResponse = {
  id: '1',
  username: 'alice123',
  email: 'alice@example.com',
  roles: ['user'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const anotherUser: UserManagementResponse = {
  id: '99',
  username: 'bob99',
  email: 'bob@test.com',
  roles: ['admin'],
  created_by: 'system',
  updated_by: 'system',
  created_at: '2024-06-01T00:00:00Z',
  updated_at: '2024-06-15T00:00:00Z',
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function renderComponent(newUser?: UserManagementResponse | null) {
  return render(
    <MemoryRouter>
      <CreateUserLeftPanel newUser={newUser} />
    </MemoryRouter>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('CreateUserLeftPanel', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────
  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderComponent(mockNewUser);
      expect(screen.getByTestId('rc-left-panel')).toBeInTheDocument();
    });

    it('renders RcLeftPanel with variant="create"', () => {
      renderComponent(mockNewUser);
      expect(screen.getByTestId('rc-left-panel')).toHaveAttribute(
        'data-variant',
        'create'
      );
    });

    it('renders RcLeftPanel with backLabel="Back"', () => {
      renderComponent(mockNewUser);
      expect(screen.getByTestId('rc-left-panel')).toHaveAttribute(
        'data-back-label',
        'Back'
      );
    });

    it('renders RcLeftPanel with width="60%"', () => {
      renderComponent(mockNewUser);
      expect(screen.getByTestId('rc-left-panel')).toHaveAttribute(
        'data-width',
        '60%'
      );
    });

    it('renders UserListCard inside RcLeftPanel', () => {
      renderComponent(mockNewUser);
      expect(screen.getByTestId('user-list-card')).toBeInTheDocument();
    });

    it('renders the back button with label "Back"', () => {
      renderComponent(mockNewUser);
      expect(screen.getByTestId('back-button')).toHaveTextContent('Back');
    });
  });

  // ── Props forwarding ───────────────────────────────────────────────────────
  describe('Props forwarding', () => {
    it('passes newUser to UserListCard', () => {
      renderComponent(mockNewUser);
      const card = screen.getByTestId('user-list-card');
      expect(JSON.parse(card.getAttribute('data-new-user')!)).toEqual(
        mockNewUser
      );
    });

    it('passes a different UserManagementResponse correctly', () => {
      renderComponent(anotherUser);
      const card = screen.getByTestId('user-list-card');
      expect(JSON.parse(card.getAttribute('data-new-user')!)).toEqual(
        anotherUser
      );
    });

    it('passes null newUser without crashing', () => {
      renderComponent(null);
      expect(screen.getByTestId('user-list-card')).toBeInTheDocument();
    });

    it('passes undefined newUser without crashing', () => {
      renderComponent(undefined);
      expect(screen.getByTestId('user-list-card')).toBeInTheDocument();
    });

    it('forwards optional fields (created_by, updated_by) correctly', () => {
      renderComponent(anotherUser);
      const card = screen.getByTestId('user-list-card');
      const parsed: UserManagementResponse = JSON.parse(
        card.getAttribute('data-new-user')!
      );
      expect(parsed.created_by).toBe('system');
      expect(parsed.updated_by).toBe('system');
    });

    it('passes user with multiple roles correctly', () => {
      const multiRoleUser: UserManagementResponse = {
        ...mockNewUser,
        roles: ['admin', 'user', 'moderator'],
      };
      renderComponent(multiRoleUser);
      const card = screen.getByTestId('user-list-card');
      const parsed: UserManagementResponse = JSON.parse(
        card.getAttribute('data-new-user')!
      );
      expect(parsed.roles).toEqual(['admin', 'user', 'moderator']);
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────────
  describe('Navigation', () => {
    it('does not call navigate on initial render', () => {
      renderComponent(mockNewUser);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('calls navigate(-1) once when back button is clicked', () => {
      renderComponent(mockNewUser);
      fireEvent.click(screen.getByTestId('back-button'));
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('calls navigate(-1) on each successive back-button click', () => {
      renderComponent(mockNewUser);
      const btn = screen.getByTestId('back-button');
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
      expect(mockNavigate).toHaveBeenNthCalledWith(2, -1);
      expect(mockNavigate).toHaveBeenNthCalledWith(3, -1);
    });
  });

  // ── Mock call verification ─────────────────────────────────────────────────
  describe('Mock call verification', () => {
    it('RcLeftPanel receives onBack as a function', async () => {
      const RcLeftPanel = (
        await import('@/core/components/RcLeftPanel')
      ).default as ReturnType<typeof vi.fn>;
      renderComponent(mockNewUser);
      const lastCall =
        RcLeftPanel.mock.calls[RcLeftPanel.mock.calls.length - 1];
      expect(typeof lastCall[0].onBack).toBe('function');
    });

    it('UserListCard receives newUser as a prop', async () => {
      const UserListCard = (
        await import('@/modules/UserLifecycle/components/UserListCard')
      ).default as ReturnType<typeof vi.fn>;
      renderComponent(mockNewUser);
      const lastCall =
        UserListCard.mock.calls[UserListCard.mock.calls.length - 1];
      expect(lastCall[0].newUser).toEqual(mockNewUser);
    });

    it('RcLeftPanel is called with all expected static props', async () => {
      const RcLeftPanel = (
        await import('@/core/components/RcLeftPanel')
      ).default as ReturnType<typeof vi.fn>;
      renderComponent(mockNewUser);
      const lastCall =
        RcLeftPanel.mock.calls[RcLeftPanel.mock.calls.length - 1];
      expect(lastCall[0]).toMatchObject({
        variant: 'create',
        backLabel: 'Back',
        width: '60%',
      });
    });

    it('UserListCard receives null when newUser is null', async () => {
      const UserListCard = (
        await import('@/modules/UserLifecycle/components/UserListCard')
      ).default as ReturnType<typeof vi.fn>;
      renderComponent(null);
      const lastCall =
        UserListCard.mock.calls[UserListCard.mock.calls.length - 1];
      expect(lastCall[0].newUser).toBeNull();
    });
  });
});