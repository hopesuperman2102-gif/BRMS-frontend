import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HubPage from './HubPage';

/* ─── Hoisted mocks ───────────────────────────────────────── */

const mockNavigate = vi.fn();
const mockUseRole = vi.fn();
const mockGetVerticalProjects = vi.fn();
const mockInvalidateProjectsCache = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/modules/auth/hooks/useRole', () => ({
  useRole: () => mockUseRole(),
}));

vi.mock('@/modules/hub/api/projectsApi', () => ({
  projectsApi: {
    getVerticalProjects: (...args: unknown[]) => mockGetVerticalProjects(...args),
    invalidateProjectsCache: (...args: unknown[]) => mockInvalidateProjectsCache(...args),
  },
}));

vi.mock('@/modules/hub/components/HubProjects', () => ({
  __esModule: true,
  default: () => <div data-testid="hub-projects">Hub Projects Content</div>,
}));

vi.mock('@/modules/hub/components/HubRules', () => ({
  __esModule: true,
  default: () => <div data-testid="hub-rules">Hub Rules Content</div>,
}));

vi.mock('@/modules/deploy/page/DeployTabPage', () => ({
  __esModule: true,
  default: () => <div data-testid="deploy-tab">Deploy Tab Content</div>,
}));

/* ─── Helpers ─────────────────────────────────────────────── */

const renderComponent = (initialPath = '/vertical/v1/dashboard/hub') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/vertical/:vertical_Key/dashboard/hub" element={<HubPage />} />
        <Route path="/dashboard/hub" element={<HubPage />} />
      </Routes>
    </MemoryRouter>,
  );

const renderAndWait = async (initialPath = '/vertical/v1/dashboard/hub') => {
  renderComponent(initialPath);
  await screen.findByText('Vertical One');
};

describe('HubPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseRole.mockReturnValue({
      roles: [],
      hasRole: vi.fn().mockReturnValue(false),
      isRuleAuthor: false,
      isReviewer: false,
      isViewer: false,
      isSuperAdmin: false,
    });

    mockGetVerticalProjects.mockResolvedValue({
      vertical_name: 'Vertical One',
    });
  });

  it('fetches and displays vertical name', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockGetVerticalProjects).toHaveBeenCalledWith('v1');
    });

    expect(await screen.findByText('Vertical One')).toBeInTheDocument();
  });

  it('does not fetch vertical name when vertical key is missing', async () => {
    renderComponent('/dashboard/hub');

    await waitFor(() => {
      expect(mockGetVerticalProjects).not.toHaveBeenCalled();
    });

    expect(screen.queryByText('Vertical One')).not.toBeInTheDocument();
  });

  it('navigates back on back button click', async () => {
    await renderAndWait();

    const backButton = screen.getByRole('button');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/vertical/v1/dashboard');
  });

  it('shows only Projects tab for rule author', async () => {
    mockUseRole.mockReturnValue({
      roles: [],
      hasRole: vi.fn().mockReturnValue(false),
      isRuleAuthor: true,
      isReviewer: false,
      isViewer: false,
      isSuperAdmin: false,
    });

    await renderAndWait();

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.queryByText('Rules')).not.toBeInTheDocument();
    expect(screen.queryByText('Deploy')).not.toBeInTheDocument();
    expect(screen.getByTestId('hub-projects')).toBeInTheDocument();
  });

  it('shows only Projects tab for viewer', async () => {
    mockUseRole.mockReturnValue({
      roles: [],
      hasRole: vi.fn().mockReturnValue(false),
      isRuleAuthor: false,
      isReviewer: false,
      isViewer: true,
      isSuperAdmin: false,
    });

    await renderAndWait();

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.queryByText('Rules')).not.toBeInTheDocument();
    expect(screen.queryByText('Deploy')).not.toBeInTheDocument();
    expect(screen.getByTestId('hub-projects')).toBeInTheDocument();
  });

  it('shows Projects and Rules tabs for reviewer', async () => {
    mockUseRole.mockReturnValue({
      roles: [],
      hasRole: vi.fn().mockReturnValue(false),
      isRuleAuthor: false,
      isReviewer: true,
      isViewer: false,
      isSuperAdmin: false,
    });

    await renderAndWait();

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Rules')).toBeInTheDocument();
    expect(screen.queryByText('Deploy')).not.toBeInTheDocument();
    expect(screen.getByTestId('hub-projects')).toBeInTheDocument();
  });

  it('shows Projects, Rules and Deploy tabs for admin-like user', async () => {
    await renderAndWait();

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Rules')).toBeInTheDocument();
    expect(screen.getByText('Deploy')).toBeInTheDocument();
    expect(screen.getByTestId('hub-projects')).toBeInTheDocument();
  });

  it('switches to Rules tab and invalidates cache', async () => {
    await renderAndWait();

    fireEvent.click(screen.getByRole('tab', { name: 'Rules' }));

    await waitFor(() => {
      expect(mockInvalidateProjectsCache).toHaveBeenCalledWith('v1');
    });

    expect(screen.getByTestId('hub-rules')).toBeInTheDocument();
  });

  it('switches to Deploy tab and invalidates cache', async () => {
    await renderAndWait();

    fireEvent.click(screen.getByRole('tab', { name: 'Deploy' }));

    await waitFor(() => {
      expect(mockInvalidateProjectsCache).toHaveBeenCalledWith('v1');
    });

    expect(screen.getByTestId('deploy-tab')).toBeInTheDocument();
  });

  it('keeps Projects tab selected initially', async () => {
    await renderAndWait();

    expect(screen.getByTestId('hub-projects')).toBeInTheDocument();
    expect(screen.queryByTestId('hub-rules')).not.toBeInTheDocument();
    expect(screen.queryByTestId('deploy-tab')).not.toBeInTheDocument();
  });

  it('handles vertical fetch failure gracefully', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetVerticalProjects.mockRejectedValue(new Error('Failed to fetch vertical'));

    renderComponent();

    await waitFor(() => {
      expect(mockGetVerticalProjects).toHaveBeenCalledWith('v1');
    });

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(
        'Error fetching vertical:',
        expect.any(Error),
      );
    });

    expect(screen.queryByText('Vertical One')).not.toBeInTheDocument();

    errorSpy.mockRestore();
  });

  it('does not invalidate cache when vertical key is missing and tab changes', async () => {
    renderComponent('/dashboard/hub');

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Rules')).toBeInTheDocument();
    expect(screen.getByText('Deploy')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Rules' }));

    await waitFor(() => {
      expect(mockInvalidateProjectsCache).not.toHaveBeenCalled();
    });

    expect(screen.getByTestId('hub-rules')).toBeInTheDocument();
  });

  it('does not set vertical name after unmount when fetch resolves late', async () => {
    let resolvePromise!: (value: { vertical_name: string }) => void;

    mockGetVerticalProjects.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { unmount } = renderComponent();

    await waitFor(() => {
      expect(mockGetVerticalProjects).toHaveBeenCalledWith('v1');
    });

    unmount();

    await act(async () => {
      resolvePromise({ vertical_name: 'Late Vertical' });
      await Promise.resolve();
    });

    expect(screen.queryByText('Late Vertical')).not.toBeInTheDocument();
  });

  it('does not log error after unmount when fetch rejects late', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let rejectPromise!: (reason?: unknown) => void;

    mockGetVerticalProjects.mockReturnValue(
      new Promise((_, reject) => {
        rejectPromise = reject;
      }),
    );

    const { unmount } = renderComponent();

    await waitFor(() => {
      expect(mockGetVerticalProjects).toHaveBeenCalledWith('v1');
    });

    unmount();

    await act(async () => {
      rejectPromise(new Error('Late failure'));
      await Promise.resolve();
    });

    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it('falls back to Projects tab when current tab becomes out of range', async () => {
  mockUseRole.mockReturnValue({
    roles: [],
    hasRole: vi.fn().mockReturnValue(false),
    isRuleAuthor: false,
    isReviewer: false,
    isViewer: false,
    isSuperAdmin: false,
  });

  const view = render(
    <MemoryRouter initialEntries={['/vertical/v1/dashboard/hub']}>
      <Routes>
        <Route path="/vertical/:vertical_Key/dashboard/hub" element={<HubPage />} />
      </Routes>
    </MemoryRouter>,
  );

  await screen.findByText('Vertical One');

  fireEvent.click(screen.getByRole('tab', { name: 'Deploy' }));
  expect(screen.getByTestId('deploy-tab')).toBeInTheDocument();

  mockUseRole.mockReturnValue({
    roles: [],
    hasRole: vi.fn().mockReturnValue(false),
    isRuleAuthor: true,
    isReviewer: false,
    isViewer: false,
    isSuperAdmin: false,
  });

  view.rerender(
    <MemoryRouter initialEntries={['/vertical/v1/dashboard/hub']}>
      <Routes>
        <Route path="/vertical/:vertical_Key/dashboard/hub" element={<HubPage />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(screen.getByRole('tab', { name: 'Projects' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.queryByRole('tab', { name: 'Rules' })).not.toBeInTheDocument();
  expect(screen.queryByRole('tab', { name: 'Deploy' })).not.toBeInTheDocument();
  expect(screen.getByTestId('hub-projects')).toBeInTheDocument();
});
});