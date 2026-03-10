import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppBarComponent from './AppBarComponent';

const mockNavigate = vi.fn();
const mockGetAccessToken = vi.fn(() => 'token-123');
const mockSetAccessToken = vi.fn();
const mockSetIsAuthenticated = vi.fn();
const mockLogoutApi = vi.fn();
const mockGetCurrentUserApi = vi.fn();

let roleState = {
  isRuleAuthor: false,
  isReviewer: false,
  isViewer: false,
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/modules/auth/context/Authcontext', () => ({
  useAuth: () => ({
    getAccessToken: mockGetAccessToken,
    setAccessToken: mockSetAccessToken,
    setIsAuthenticated: mockSetIsAuthenticated,
  }),
}));

vi.mock('@/modules/auth/services/Authservice', () => ({
  logoutApi: (...args: unknown[]) => mockLogoutApi(...args),
}));

vi.mock('@/modules/auth/hooks/useRole', () => ({
  useRole: () => roleState,
}));

vi.mock('@/modules/auth/services/UserService', () => ({
  getCurrentUserApi: () => mockGetCurrentUserApi(),
}));

vi.mock('@/core/components/HeaderIcon', () => ({
  default: ({
    icon,
    tooltip,
    onClick,
  }: {
    icon: React.ReactNode;
    tooltip: string;
    onClick: (event: { currentTarget: HTMLElement }) => void;
  }) => (
    <button
      type="button"
      aria-label={tooltip}
      onClick={(event) => onClick({ currentTarget: event.currentTarget })}
    >
      {icon}
    </button>
  ),
}));

vi.mock('@/core/components/LogoTitle', () => ({
  default: ({
    organizationName,
  }: {
    organizationName: string;
  }) => <div>{organizationName}</div>,
}));

vi.mock('@/core/components/SectionHeader', () => ({
  default: ({
    left,
    right,
  }: {
    left: React.ReactNode;
    right: React.ReactNode;
  }) => (
    <div>
      {left}
      {right}
    </div>
  ),
}));

const defaultProps = {
  logo: <span data-testid="logo">L</span>,
  organizationName: 'Business Rules',
};

function renderAppBar(
  props: Partial<React.ComponentProps<typeof AppBarComponent>> = {}
) {
  return render(<AppBarComponent {...defaultProps} {...props} />);
}

describe('AppBarComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    roleState = { isRuleAuthor: false, isReviewer: false, isViewer: false };
    mockGetCurrentUserApi.mockResolvedValue({
      avatar: '',
      name: 'John Doe',
      id: 'JD001',
      roles: ['Admin'],
      email: 'john@example.com',
    });
  });

  describe('Rendering', () => {
    it('renders organization name', () => {
      renderAppBar();

      expect(screen.getByText('Business Rules')).toBeInTheDocument();
    });

    it('renders settings and profile actions for admin users', () => {
      renderAppBar();

      expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument();
    });

    it('hides settings action for restricted roles', () => {
      roleState = { isRuleAuthor: true, isReviewer: false, isViewer: false };
      renderAppBar();

      expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument();
    });
  });

  describe('Profile popover', () => {
    it('shows loading state while user data is loading', () => {
      mockGetCurrentUserApi.mockImplementation(() => new Promise(() => {}));
      renderAppBar();

      fireEvent.click(screen.getByRole('button', { name: 'Profile' }));

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows fetched user details in profile popover', async () => {
      renderAppBar();

      fireEvent.click(screen.getByRole('button', { name: 'Profile' }));

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('JD001')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });
    });

    it('shows error message when user fetch fails', async () => {
      mockGetCurrentUserApi.mockRejectedValue(new Error('Failed to load user data'));
      renderAppBar();

      fireEvent.click(screen.getByRole('button', { name: 'Profile' }));

      await waitFor(() => {
        expect(screen.getByText('Failed to load user data')).toBeInTheDocument();
      });
    });

    it('logs out and navigates to login', async () => {
      renderAppBar();
      fireEvent.click(screen.getByRole('button', { name: 'Profile' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

      await waitFor(() => {
        expect(mockLogoutApi).toHaveBeenCalledWith('token-123');
        expect(mockSetAccessToken).toHaveBeenCalledWith(null);
        expect(mockSetIsAuthenticated).toHaveBeenCalledWith(false);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Settings menu', () => {
    it('opens settings menu and navigates to logs', () => {
      renderAppBar();

      fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
      fireEvent.click(screen.getByText('Activity Logs'));

      expect(mockNavigate).toHaveBeenCalledWith('/logs');
    });

    it('navigates to signup from settings menu', () => {
      renderAppBar();

      fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
      fireEvent.click(screen.getByText('User Create'));

      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });
  });
});
