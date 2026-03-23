import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HubProjects from './HubProjects';

/* ─── Mocks ───────────────────────────────────────────────── */

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/modules/hub/api/projectsApi', () => ({
  projectsApi: {
    invalidateProjectsCache: vi.fn(),
    getVerticalProjects: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

vi.mock('@/modules/auth/hooks/useRole', () => ({
  useRole: vi.fn(),
}));

vi.mock('@/core/components/RcAlertComponent', () => ({
  useAlertStore: vi.fn(),
}));

vi.mock('@/modules/hub/components/ProjectListLeftPanel', () => ({
  default: ({ projects }: { projects: unknown[] }) => (
    <div data-testid="left-panel">Projects: {projects.length}</div>
  ),
}));

vi.mock('@/modules/hub/components/ProjectListRightPanel', () => ({
  default: ({
    loading,
    paginatedProjects,
    onNewProject,
    onOpenProject,
    onMenuOpen,
    onDelete,
    onEdit,
  }: {
    loading: boolean;
    paginatedProjects: { project_key: string; name: string }[];
    onNewProject: () => void;
    onOpenProject: (p: { project_key: string; name: string }) => void;
    onMenuOpen: (e: React.MouseEvent, p: { project_key: string; name: string }) => void;
    onDelete: () => void;
    onEdit: () => void;
  }) => (
    <div data-testid="right-panel">
      {loading && <span data-testid="loading">Loading</span>}
      <button onClick={onNewProject}>New Project</button>
      {paginatedProjects.map((p) => (
        <div key={p.project_key}>
          <span>{p.name}</span>
          <button onClick={() => onOpenProject(p)}>Open</button>
          <button onClick={(e) => onMenuOpen(e, p)}>Menu</button>
        </div>
      ))}
      <button onClick={onDelete}>Delete</button>
      <button onClick={onEdit}>Edit</button>
    </div>
  ),
}));

/* ─── Imports after mocks ─────────────────────────────────── */

import { projectsApi } from '@/modules/hub/api/projectsApi';
import { useRole } from '@/modules/auth/hooks/useRole';
import { useAlertStore } from '@/core/components/RcAlertComponent';

/* ─── Mock data ───────────────────────────────────────────── */

const mockProjects = [
  {
    id: '1',
    project_key: 'proj-1',
    name: 'Project Alpha',
    description: 'Alpha desc',
    domain: 'finance',
    updated_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    project_key: 'proj-2',
    name: 'Project Beta',
    description: 'Beta desc',
    domain: 'healthcare',
    updated_at: '2024-02-01T00:00:00Z',
    created_at: '2024-02-01T00:00:00Z',
  },
];

const mockShowAlert = vi.fn();
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

const makeRole = (overrides: Partial<ReturnType<typeof useRole>> = {}): ReturnType<typeof useRole> => ({
  roles: [],
  hasRole: vi.fn().mockReturnValue(false),
  isRuleAuthor: false,
  isReviewer: false,
  isViewer: false,
  isSuperAdmin: false,
  ...overrides,
});

const renderComponent = (verticalKey = 'v1') =>
  render(
    <MemoryRouter initialEntries={[`/vertical/${verticalKey}/dashboard/hub`]}>
      <Routes>
        <Route path="/vertical/:vertical_Key/dashboard/hub" element={<HubProjects />} />
      </Routes>
    </MemoryRouter>
  );

const renderWithoutVerticalKey = () =>
  render(
    <MemoryRouter initialEntries={['/vertical/dashboard/hub']}>
      <Routes>
        <Route path="/vertical/dashboard/hub" element={<HubProjects />} />
      </Routes>
    </MemoryRouter>
  );

/* ─── Tests ───────────────────────────────────────────────── */

describe('HubProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRole).mockReturnValue(makeRole());

    vi.mocked(useAlertStore).mockReturnValue({
      showAlert: mockShowAlert,
    });

    vi.mocked(projectsApi.getVerticalProjects).mockResolvedValue({
      vertical_key: 'v1',
      vertical_name: 'Vertical 1',
      status: 'active',
      projects: mockProjects,
    });
  });

  /* ─── Rendering ─── */

  it('renders left and right panels', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('left-panel')).toBeInTheDocument();
      expect(screen.getByTestId('right-panel')).toBeInTheDocument();
    });
  });

  it('fetches and displays projects on mount', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
    });
  });

  it('calls invalidateProjectsCache with correct vertical key on mount', async () => {
    renderComponent();
    await waitFor(() => {
      expect(projectsApi.invalidateProjectsCache).toHaveBeenCalledWith('v1');
    });
  });

  it('passes correct project count to left panel', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Projects: 2')).toBeInTheDocument();
    });
  });

  it('does not fetch projects when vertical key is missing', async () => {
    renderWithoutVerticalKey();

    await waitFor(() => {
      expect(screen.getByTestId('left-panel')).toBeInTheDocument();
      expect(screen.getByTestId('right-panel')).toBeInTheDocument();
    });

    expect(projectsApi.invalidateProjectsCache).not.toHaveBeenCalled();
    expect(projectsApi.getVerticalProjects).not.toHaveBeenCalled();
  });

  it('maps project using created_at when updated_at is missing', async () => {
    vi.mocked(projectsApi.getVerticalProjects).mockResolvedValue({
      vertical_key: 'v1',
      vertical_name: 'Vertical 1',
      status: 'active',
      projects: [
        {
          id: '1',
          project_key: 'proj-1',
          name: 'Project Alpha',
          description: 'Alpha desc',
          domain: 'finance',
          updated_at: undefined,
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });
  });

  /* ─── New Project ─── */

  it('navigates to create project when canManageProjects is true', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('New Project'));

    fireEvent.click(screen.getByText('New Project'));

    expect(mockNavigate).toHaveBeenCalledWith('/vertical/v1/dashboard/hub/createproject');
    expect(mockShowAlert).not.toHaveBeenCalled();
  });

  it('shows alert when RULE_AUTHOR clicks New Project', async () => {
    vi.mocked(useRole).mockReturnValue(makeRole({ isRuleAuthor: true }));
    renderComponent();

    await waitFor(() => screen.getByText('New Project'));
    fireEvent.click(screen.getByText('New Project'));

    expect(mockShowAlert).toHaveBeenCalledWith(
      'You do not have permission to create projects.',
      'info',
    );
  });

  it('shows alert when REVIEWER clicks New Project', async () => {
    vi.mocked(useRole).mockReturnValue(makeRole({ isReviewer: true }));
    renderComponent();

    await waitFor(() => screen.getByText('New Project'));
    fireEvent.click(screen.getByText('New Project'));

    expect(mockShowAlert).toHaveBeenCalledWith(
      'You do not have permission to create projects.',
      'info',
    );
  });

  it('shows alert when VIEWER clicks New Project', async () => {
    vi.mocked(useRole).mockReturnValue(makeRole({ isViewer: true }));
    renderComponent();

    await waitFor(() => screen.getByText('New Project'));
    fireEvent.click(screen.getByText('New Project'));

    expect(mockShowAlert).toHaveBeenCalledWith(
      'You do not have permission to create projects.',
      'info',
    );
  });

  /* ─── Delete ─── */

  it('deletes a project when canManageProjects is true', async () => {
    vi.mocked(projectsApi.deleteProject).mockResolvedValue(undefined);

    renderComponent();

    await waitFor(() => screen.getAllByText('Menu'));
    fireEvent.click(screen.getAllByText('Menu')[0]);
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(projectsApi.deleteProject).toHaveBeenCalledWith('proj-1', 'admin');
    });
  });

  it('removes deleted project from list', async () => {
    vi.mocked(projectsApi.deleteProject).mockResolvedValue(undefined);

    renderComponent();

    await waitFor(() => screen.getByText('Project Alpha'));
    fireEvent.click(screen.getAllByText('Menu')[0]);
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.queryByText('Project Alpha')).not.toBeInTheDocument();
    });
  });

  it('does nothing when delete is clicked without selecting a project', async () => {
    vi.mocked(projectsApi.deleteProject).mockResolvedValue(undefined);

    renderComponent();

    await waitFor(() => screen.getByText('Delete'));
    fireEvent.click(screen.getByText('Delete'));

    expect(projectsApi.deleteProject).not.toHaveBeenCalled();
  });

  it('keeps project in list when delete project API fails', async () => {
  vi.mocked(projectsApi.deleteProject).mockRejectedValue(new Error('Delete failed'));

  renderComponent();

  await waitFor(() => {
    expect(screen.getAllByText('Menu')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByText('Menu')[0]);
  fireEvent.click(screen.getByText('Delete'));

  await waitFor(() => {
    expect(projectsApi.deleteProject).toHaveBeenCalledWith('proj-1', 'admin');
  });

  expect(screen.getByText('Project Alpha')).toBeInTheDocument();
  expect(screen.getByText('Project Beta')).toBeInTheDocument();
});

  it('shows alert when REVIEWER tries to delete', async () => {
    vi.mocked(useRole).mockReturnValue(makeRole({ isReviewer: true,}));
    renderComponent();

    await waitFor(() => screen.getByText('Delete'));
    fireEvent.click(screen.getByText('Delete'));

    expect(mockShowAlert).toHaveBeenCalledWith(
      'You do not have permission to delete projects.',
      'info',
    );
  });

  /* ─── Edit ─── */

  it('navigates to edit page when canManageProjects is true', async () => {
    renderComponent();

    await waitFor(() => screen.getAllByText('Menu'));
    fireEvent.click(screen.getAllByText('Menu')[0]);
    fireEvent.click(screen.getByText('Edit'));

    expect(mockNavigate).toHaveBeenCalledWith(
      '/vertical/v1/dashboard/hub/createproject?key=proj-1',
    );
    expect(mockShowAlert).not.toHaveBeenCalled();
  });

  it('does nothing when edit is clicked without selecting a project', async () => {
    renderComponent();

    await waitFor(() => screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Edit'));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows alert when VIEWER tries to edit', async () => {
    vi.mocked(useRole).mockReturnValue(makeRole({ isViewer: true }));
    renderComponent();

    await waitFor(() => screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Edit'));

    expect(mockShowAlert).toHaveBeenCalledWith(
      'You do not have permission to edit projects.',
      'info',
    );
  });

  /* ─── Open Project ─── */

  it('navigates to rules page when a project is opened', async () => {
    renderComponent();

    await waitFor(() => screen.getAllByText('Open'));
    fireEvent.click(screen.getAllByText('Open')[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/vertical/v1/dashboard/hub/proj-1/rules');
  });

  /* ─── API failure ─── */

  it('handles fetch failure gracefully without crashing', async () => {
    vi.mocked(projectsApi.getVerticalProjects).mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('right-panel')).toBeInTheDocument();
    });

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Failed to load projects:',
      expect.any(Error),
    );
  });

  /* ─── Pagination ─── */

  it('shows only first 5 projects when there are more than 5', async () => {
    const manyProjects = Array.from({ length: 8 }, (_, i) => ({
      id: String(i + 1),
      project_key: `proj-${i + 1}`,
      name: `Project ${i + 1}`,
      description: '',
      domain: '',
      status: 'active',
      updated_at: undefined,
      created_at: '2024-01-01T00:00:00Z',
    }));

    vi.mocked(projectsApi.getVerticalProjects).mockResolvedValue({
      vertical_key: 'v1',
      vertical_name: 'Vertical 1',
      status: 'active',
      projects: manyProjects,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.queryByText('Project 6')).not.toBeInTheDocument();
    });
  });

  it('does not set projects when request resolves after unmount', async () => {
  let resolvePromise!: (value: {
    vertical_key: string;
    vertical_name: string;
    status: string;
    projects: typeof mockProjects;
  }) => void;

  vi.mocked(projectsApi.getVerticalProjects).mockImplementation(
    () =>
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
  );

  const { unmount } = renderComponent();

  await waitFor(() => {
    expect(projectsApi.getVerticalProjects).toHaveBeenCalled();
  });

  unmount();

  resolvePromise({
    vertical_key: 'v1',
    vertical_name: 'Vertical 1',
    status: 'active',
    projects: mockProjects,
  });

  await Promise.resolve();

  expect(mockConsoleError).not.toHaveBeenCalled();
});

it('does not log error when request rejects after unmount', async () => {
  let rejectPromise!: (reason?: unknown) => void;

  vi.mocked(projectsApi.getVerticalProjects).mockImplementation(
    () =>
      new Promise((_, reject) => {
        rejectPromise = reject;
      }),
  );

  const { unmount } = renderComponent();

  await waitFor(() => {
    expect(projectsApi.getVerticalProjects).toHaveBeenCalled();
  });

  unmount();

  rejectPromise(new Error('Request aborted after unmount'));

  await Promise.resolve();

  expect(mockConsoleError).not.toHaveBeenCalled();
});

it('maps updatedAt as empty string when both updated_at and created_at are missing', async () => {
  vi.mocked(projectsApi.getVerticalProjects).mockResolvedValue({
    vertical_key: 'v1',
    vertical_name: 'Vertical 1',
    status: 'active',
    projects: [
      {
        id: '1',
        project_key: 'proj-1',
        name: 'Project Alpha',
        description: 'Alpha desc',
        domain: 'finance',
        updated_at: undefined,
        created_at: undefined,
      },
    ],
  });

  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
  });
});
});