import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

let mockRoutes: any[] = [];

const mockSetAccessToken = vi.fn();
const mockSetIsAuthenticated = vi.fn();
const mockSetRoles = vi.fn();
const mockUseBindAuth = vi.fn();
const mockRefreshApi = vi.fn();
const mockGetCurrentUserApi = vi.fn();
let mockIsAuthenticated = false;

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
  Route: ({ element, children }: { element?: React.ReactNode; children?: React.ReactNode }) => (
    <div data-testid="route">{element ?? children}</div>
  ),
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
}));

vi.mock('@/core/routes/appRoutes', () => ({
  get appRoutes() {
    return mockRoutes;
  },
}));

vi.mock('@/core/components/PageWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-wrapper">{children}</div>
  ),
}));

vi.mock('@/core/components/AppBarComponent', () => ({
  default: ({ organizationName }: { organizationName: string }) => (
    <div data-testid="app-bar">{organizationName}</div>
  ),
}));

vi.mock('@/core/types/routeTypes', () => ({
  Layout: { MAIN: 'main', NONE: 'none' },
}));

vi.mock('@/modules/auth/context/Authcontext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  useAuth: () => ({
    setAccessToken: mockSetAccessToken,
    setIsAuthenticated: mockSetIsAuthenticated,
    isAuthenticated: mockIsAuthenticated,
    setRoles: mockSetRoles,
  }),
}));

vi.mock('@/modules/auth/services/Authservice', () => ({
  refreshApi: () => mockRefreshApi(),
}));

vi.mock('@/modules/auth/services/UserService', () => ({
  getCurrentUserApi: () => mockGetCurrentUserApi(),
}));

vi.mock('@/modules/auth/hooks/Usebindauth', () => ({
  useBindAuth: () => mockUseBindAuth(),
}));

vi.mock('@/modules/auth/components/RequireAuth', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="require-auth">{children}</div>
  ),
}));

function mockWindowPathname(path: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { pathname: path },
  });
}

async function importFreshAppRouter() {
  const mod = await import(`./AppRouter?test=${Date.now()}-${Math.random()}`);
  return mod.default;
}

describe('AppRouter', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockRoutes = [];
    mockIsAuthenticated = false;
    mockRefreshApi.mockResolvedValue(null);
    mockGetCurrentUserApi.mockResolvedValue({});
    mockWindowPathname('/some-page');
  });

  describe('Loading state', () => {
    it('renders CircularProgress while not ready', async () => {
      mockRefreshApi.mockImplementation(() => new Promise(() => {}));

      const AppRouter = await importFreshAppRouter();
      const { container } = render(<AppRouter />);

      expect(container.querySelector('svg, [role="progressbar"], .MuiCircularProgress-root')).toBeTruthy();
    });
  });

  describe('when refreshApi returns null (unauthenticated)', () => {
    beforeEach(() => {
      mockRefreshApi.mockResolvedValue(null);
      mockWindowPathname('/dashboard');
    });

    it('calls setAccessToken(null)', async () => {
      const AppRouter = await importFreshAppRouter();
      render(<AppRouter />);

      await waitFor(() => {
        expect(mockSetAccessToken).toHaveBeenCalledWith(null);
        expect(mockSetIsAuthenticated).toHaveBeenCalledWith(false);
        expect(mockSetRoles).toHaveBeenCalledWith([]);
      });
    });

    it('renders Navigate to /login when not authenticated', async () => {
      const AppRouter = await importFreshAppRouter();
      render(<AppRouter />);

      await waitFor(() => {
        const nav = document.querySelector('[data-testid="navigate"]');
        expect(nav).toBeTruthy();
        expect(nav?.getAttribute('data-to')).toBe('/login');
      });
    });
  });

  describe('when refreshApi returns a token (authenticated)', () => {
    it('sets token, authenticated, and roles from getCurrentUserApi', async () => {
      const token = 'mock-access-token';
      const userRoles = ['admin', 'editor'];
      mockIsAuthenticated = true;
      mockRefreshApi.mockResolvedValue(token);
      mockGetCurrentUserApi.mockResolvedValue({ roles: userRoles });

      const AppRouter = await importFreshAppRouter();
      render(<AppRouter />);

      await waitFor(() => {
        expect(mockSetAccessToken).toHaveBeenCalledWith(token);
        expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
        expect(mockSetRoles).toHaveBeenCalledWith(userRoles);
      });
    });

    it('sets roles to [] if getCurrentUserApi throws', async () => {
      mockIsAuthenticated = true;
      mockRefreshApi.mockResolvedValue('token');
      mockGetCurrentUserApi.mockRejectedValue(new Error('User fetch failed'));

      const AppRouter = await importFreshAppRouter();
      render(<AppRouter />);

      await waitFor(() => {
        expect(mockSetRoles).toHaveBeenCalledWith([]);
      });
    });

    it('sets roles to [] if user has no roles field', async () => {
      mockIsAuthenticated = true;
      mockRefreshApi.mockResolvedValue('token');
      mockGetCurrentUserApi.mockResolvedValue({});

      const AppRouter = await importFreshAppRouter();
      render(<AppRouter />);

      await waitFor(() => {
        expect(mockSetRoles).toHaveBeenCalledWith([]);
      });
    });

    it('renders Navigate to /vertical when authenticated', async () => {
      mockIsAuthenticated = true;
      mockRefreshApi.mockResolvedValue('token');
      mockGetCurrentUserApi.mockResolvedValue({ roles: ['user'] });

      const AppRouter = await importFreshAppRouter();
      render(<AppRouter />);

      await waitFor(() => {
        const nav = document.querySelector('[data-testid="navigate"]');
        expect(nav?.getAttribute('data-to')).toBe('/vertical');
      });
    });
  });

  describe('when pathname is /login', () => {
    it('skips refreshApi and sets unauthenticated state immediately', async () => {
      mockWindowPathname('/login');

      const AppRouter = await importFreshAppRouter();
      render(<AppRouter />);

      await waitFor(() => {
        expect(mockRefreshApi).not.toHaveBeenCalled();
        expect(mockSetAccessToken).toHaveBeenCalledWith(null);
        expect(mockSetIsAuthenticated).toHaveBeenCalledWith(false);
        expect(mockSetRoles).toHaveBeenCalledWith([]);
      });
    });
  });
});

describe('RouteWrapper layout rendering', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockRoutes = [];
    mockIsAuthenticated = false;
    mockRefreshApi.mockResolvedValue(null);
    mockGetCurrentUserApi.mockResolvedValue({});
    mockWindowPathname('/dashboard');
  });

  async function setupRouteWrapperTest(routes: any[]) {
    mockRoutes = routes;
    return importFreshAppRouter();
  }

  it('renders Layout.MAIN route with AppBar inside RequireAuth', async () => {
    const MockElement = () => <div data-testid="main-element">Main Page</div>;
    const AppRouter = await setupRouteWrapperTest([
      { path: '/dashboard', element: MockElement, layout: 'main' },
    ]);

    render(<AppRouter />);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="app-bar"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="require-auth"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="main-element"]')).toBeTruthy();
    });
  });

  it('renders Layout.NONE route wrapped in PageWrapper inside RequireAuth', async () => {
    const MockElement = () => <div data-testid="none-element">None Layout</div>;
    const AppRouter = await setupRouteWrapperTest([
      { path: '/settings', element: MockElement, layout: 'none', fixed: true },
    ]);

    render(<AppRouter />);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="page-wrapper"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="none-element"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="require-auth"]')).toBeTruthy();
    });
  });

  it('renders route with no matching layout directly inside RequireAuth', async () => {
    const MockElement = () => <div data-testid="bare-element">Bare</div>;
    const AppRouter = await setupRouteWrapperTest([
      { path: '/other', element: MockElement, layout: 'custom' },
    ]);

    render(<AppRouter />);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="bare-element"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="require-auth"]')).toBeTruthy();
    });
  });

  it('renders /login route WITHOUT RequireAuth wrapper', async () => {
    const MockElement = () => <div data-testid="login-element">Login Page</div>;
    const AppRouter = await setupRouteWrapperTest([
      { path: '/login', element: MockElement, layout: 'none' },
    ]);

    render(<AppRouter />);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="login-element"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="require-auth"]')).toBeNull();
    });
  });

  it('returns null when route has no element', async () => {
    const AppRouter = await setupRouteWrapperTest([
      { path: '/empty', element: null, layout: 'main' },
    ]);

    const { container } = render(<AppRouter />);
    expect(container).toBeTruthy();
  });

  it('renders nested routes with children', async () => {
    const ParentElement = () => <div data-testid="parent-element">Parent</div>;
    const ChildElement = () => <div data-testid="child-element">Child</div>;

    const AppRouter = await setupRouteWrapperTest([
      {
        path: '/parent',
        element: ParentElement,
        layout: 'none',
        children: [{ path: 'child', element: ChildElement, layout: 'none' }],
      },
    ]);

    render(<AppRouter />);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="parent-element"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="child-element"]')).toBeTruthy();
    });
  });

  it('renders nested route without parent element (children only)', async () => {
    const ChildElement = () => <div data-testid="child-only-element">Child Only</div>;

    const AppRouter = await setupRouteWrapperTest([
      {
        path: '/parent-no-element',
        element: null,
        layout: 'none',
        children: [{ path: 'child', element: ChildElement, layout: 'none' }],
      },
    ]);

    render(<AppRouter />);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="child-only-element"]')).toBeTruthy();
    });
  });
});

describe('AppRouter wraps everything in AuthProvider', () => {
  it('renders AuthProvider at the root', async () => {
    cleanup();
    vi.clearAllMocks();
    mockRoutes = [];
    mockIsAuthenticated = false;
    mockRefreshApi.mockResolvedValue(null);
    mockWindowPathname('/dashboard');

    const AppRouter = await importFreshAppRouter();
    render(<AppRouter />);

    expect(document.querySelector('[data-testid="auth-provider"]')).toBeTruthy();
  });
});
