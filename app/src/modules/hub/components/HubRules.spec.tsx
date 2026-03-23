import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import HubRules from './HubRules';

/* ─── Mocks ───────────────────────────────────────────────── */

vi.mock('@/modules/hub/api/entireRuleApi', () => ({
  rulesTableApi: {
    refreshVerticalRules: vi.fn(),
    reviewRuleVersion: vi.fn(),
  },
}));

vi.mock('@/modules/auth/hooks/useRole', () => ({
  useRole: vi.fn(),
}));

vi.mock('@/core/components/RcAlertComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="rc-alert-component" />,
  useAlertStore: vi.fn(),
}));

vi.mock('@/core/components/RcAppdrawer', () => ({
  __esModule: true,
  default: ({
    open,
    title,
    subtitle,
    children,
    actions,
    onClose,
  }: {
    open: boolean;
    title: string;
    subtitle: string;
    children: React.ReactNode;
    actions: {
      label: string;
      disabled?: boolean;
      loading?: boolean;
      onClick: () => void;
    }[];
    onClose: () => void;
  }) =>
    open ? (
      <div data-testid="app-drawer">
        <div>{title}</div>
        <div>{subtitle}</div>
        <div>{children}</div>
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
          >
            {action.loading ? 'Saving...' : action.label}
          </button>
        ))}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock('./RulesDrawer', () => ({
  __esModule: true,
  default: ({
    selectedRow,
    canReview,
  }: {
    selectedRow: { name: string; projectName: string; approvalStatus: string } | null;
    canReview: boolean;
  }) => (
    <div data-testid="rules-drawer">
      <div>{selectedRow?.name ?? 'No rule selected'}</div>
      <div>{selectedRow?.projectName ?? 'No project selected'}</div>
      <div>{selectedRow?.approvalStatus ?? 'No status'}</div>
      <div>{canReview ? 'Can Review' : 'Read Only'}</div>
    </div>
  ),
}));

/* ─── Imports after mocks ─────────────────────────────────── */

import { rulesTableApi } from '@/modules/hub/api/entireRuleApi';
import { useRole } from '@/modules/auth/hooks/useRole';
import { useAlertStore } from '@/core/components/RcAlertComponent';

/* ─── Mock data ───────────────────────────────────────────── */

const mockShowAlert = vi.fn();

const mockVerticalResponse = {
  vertical_key: 'v1',
  vertical_name: 'Vertical One',
  projects: [
    {
      project_key: 'proj-1',
      project_name: 'Project Alpha',
      rules: [
        {
          rule_key: 'rule-1',
          rule_name: 'Rule One',
          status: 'ACTIVE',
          versions: [
            {
              version: '1.0',
              status: 'APPROVED',
              created_at: '2024-01-01T00:00:00Z',
            },
            {
              version: '2.0',
              status: 'REJECTED',
              created_at: '2024-01-02T00:00:00Z',
            },
          ],
        },
        {
          rule_key: 'rule-2',
          rule_name: 'Rule Two',
          status: 'DRAFT',
          versions: [],
        },
        {
          rule_key: 'rule-3',
          rule_name: 'Rule Archived',
          status: 'ARCHIVED',
          versions: [
            {
              version: '1.0',
              status: 'PENDING',
              created_at: '2024-01-03T00:00:00Z',
            },
          ],
        },
        {
          rule_key: 'rule-4',
          rule_name: 'Rule Deleted',
          status: 'DELETED',
          versions: [
            {
              version: '1.0',
              status: 'APPROVED',
              created_at: '2024-01-04T00:00:00Z',
            },
          ],
        },
        {
          rule_key: 'rule-5',
          rule_name: 'Rule Unknown Status',
          status: 'USING',
          versions: [
            {
              version: '3.0',
              status: 'UNKNOWN',
              created_at: '2024-01-05T00:00:00Z',
            },
          ],
        },
      ],
    },
    {
      project_key: 'proj-2',
      project_name: 'Project Empty',
      rules: [],
    },
  ],
};

const makeRole = (
  overrides: Partial<ReturnType<typeof useRole>> = {},
): ReturnType<typeof useRole> => ({
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
    <MemoryRouter initialEntries={[`/vertical/${verticalKey}/dashboard/hub/rules`]}>
      <Routes>
        <Route path="/vertical/:vertical_Key/dashboard/hub/rules" element={<HubRules />} />
      </Routes>
    </MemoryRouter>,
  );

/* ─── Tests ───────────────────────────────────────────────── */

describe('HubRules', () => {
  beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useRole).mockReturnValue(
    makeRole({
      isReviewer: true,
    }),
  );

  vi.mocked(useAlertStore).mockReturnValue({
    showAlert: mockShowAlert,
  });

  vi.mocked(rulesTableApi.refreshVerticalRules).mockResolvedValue(mockVerticalResponse);
});

  it('shows loading state initially', async () => {
  renderComponent();

  expect(screen.getByRole('progressbar')).toBeInTheDocument();

  expect(await screen.findByText('Project Alpha')).toBeInTheDocument();
});

  it('renders alert component after data is loaded', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('rc-alert-component')).toBeInTheDocument();
    });
  });

  it('fetches all vertical rules on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(rulesTableApi.refreshVerticalRules).toHaveBeenCalledWith('v1');
    });
  });

  it('renders only sections that contain visible rules', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    expect(screen.queryByText('Project Empty')).not.toBeInTheDocument();
  });

  it('shows correct rule count for section', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('5 Rules')).toBeInTheDocument();
    });
  });

  it('expands section and shows rules', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Project Alpha'));

    await waitFor(() => {
      expect(screen.getAllByText('Rule One')).toHaveLength(2);
      expect(screen.getByText('Rule Two')).toBeInTheDocument();
      expect(screen.getByText('Rule Archived')).toBeInTheDocument();
      expect(screen.getByText('Rule Unknown Status')).toBeInTheDocument();
    });
  });

  it('does not show deleted rules', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Project Alpha'));

    await waitFor(() => {
      expect(screen.queryByText('Rule Deleted')).not.toBeInTheDocument();
    });
  });

  it('maps statuses correctly in expanded content', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Project Alpha'));

    await waitFor(() => {
      expect(screen.getAllByText('Draft').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Archived').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Approved').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
    });
  });

  it('opens drawer when Review is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Project Alpha'));
    fireEvent.click(screen.getAllByText('Review')[0]);

    await waitFor(() => {
      expect(screen.getByTestId('app-drawer')).toBeInTheDocument();
      expect(screen.getByTestId('rules-drawer')).toBeInTheDocument();
      expect(screen.getByText('Rule Review')).toBeInTheDocument();
      expect(screen.getByText('Review and submit decision')).toBeInTheDocument();
    });
  });

  it('passes selected row details to RulesDrawer', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Project Alpha'));
  fireEvent.click(screen.getAllByText('Review')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('rules-drawer')).toBeInTheDocument();
  });

  const drawer = screen.getByTestId('rules-drawer');

  expect(within(drawer).getByText('Rule One')).toBeInTheDocument();
  expect(within(drawer).getByText('Project Alpha')).toBeInTheDocument();
  expect(within(drawer).getByText('Approved')).toBeInTheDocument();
  expect(within(drawer).getByText('Can Review')).toBeInTheDocument();
});

  it('closes drawer when Close is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Project Alpha'));
    fireEvent.click(screen.getAllByText('Review')[0]);

    await waitFor(() => {
      expect(screen.getByTestId('app-drawer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Close'));

    await waitFor(() => {
      expect(screen.queryByTestId('app-drawer')).not.toBeInTheDocument();
    });
  });

  it('approves a pending rule successfully', async () => {
    vi.mocked(rulesTableApi.reviewRuleVersion).mockResolvedValue({
      rule_key: 'rule-3',
      version: '1.0',
      status: 'APPROVED',
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Project Alpha'));
    fireEvent.click(screen.getAllByText('Review')[3]);

    await waitFor(() => {
      expect(screen.getByTestId('app-drawer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Approve'));

    await waitFor(() => {
      expect(rulesTableApi.reviewRuleVersion).toHaveBeenCalledWith(
        'rule-3',
        '1.0',
        'APPROVED',
        'qa_user',
      );
    });

    expect(mockShowAlert).toHaveBeenCalledWith('Rule approved successfully.', 'success');
  });

  it('rejects a pending rule successfully', async () => {
    vi.mocked(rulesTableApi.reviewRuleVersion).mockResolvedValue({
      rule_key: 'rule-3',
      version: '1.0',
      status: 'REJECTED',
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Project Alpha'));
    fireEvent.click(screen.getAllByText('Review')[3]);

    await waitFor(() => {
      expect(screen.getByTestId('app-drawer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Reject'));

    await waitFor(() => {
      expect(rulesTableApi.reviewRuleVersion).toHaveBeenCalledWith(
        'rule-3',
        '1.0',
        'REJECTED',
        'qa_user',
      );
    });

    expect(mockShowAlert).toHaveBeenCalledWith('Rule rejected successfully.', 'success');
  });

  it('shows error alert when review api fails', async () => {
    vi.mocked(rulesTableApi.reviewRuleVersion).mockRejectedValue(new Error('Review failed'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Project Alpha'));
    fireEvent.click(screen.getAllByText('Review')[3]);

    await waitFor(() => {
      expect(screen.getByTestId('app-drawer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Approve'));

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith(
        'Failed to update approval status. Please try again.',
        'error',
      );
    });
  });

  it('disables actions for non-pending rows', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Project Alpha'));
    fireEvent.click(screen.getAllByText('Review')[0]);

    await waitFor(() => {
      expect(screen.getByTestId('app-drawer')).toBeInTheDocument();
    });

    expect(screen.getByText('Approve')).toBeDisabled();
    expect(screen.getByText('Reject')).toBeDisabled();
  });

  it('disables actions for rows with version "--"', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Project Alpha'));
    fireEvent.click(screen.getAllByText('Review')[2]);

    await waitFor(() => {
      expect(screen.getByTestId('app-drawer')).toBeInTheDocument();
    });

    expect(screen.getByText('Approve')).toBeDisabled();
    expect(screen.getByText('Reject')).toBeDisabled();
  });

  it('disables review actions when user does not have permission', async () => {
    vi.mocked(useRole).mockReturnValue(
      makeRole({
        isReviewer: false,
        isSuperAdmin: false,
        isViewer: true,
      }),
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Project Alpha'));
    fireEvent.click(screen.getAllByText('Review')[3]);

    await waitFor(() => {
      expect(screen.getByTestId('app-drawer')).toBeInTheDocument();
    });

    expect(screen.getByText('Approve')).toBeDisabled();
    expect(screen.getByText('Reject')).toBeDisabled();
    expect(rulesTableApi.reviewRuleVersion).not.toHaveBeenCalled();
  });

  it('shows read only mode in drawer when user cannot review', async () => {
    vi.mocked(useRole).mockReturnValue(
      makeRole({
        isReviewer: false,
        isSuperAdmin: false,
        isViewer: true,
      }),
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Project Alpha'));
    fireEvent.click(screen.getAllByText('Review')[3]);

    await waitFor(() => {
      expect(screen.getByText('Read Only')).toBeInTheDocument();
    });
  });

  it('shows error alert when vertical key is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/hub/rules']}>
        <Routes>
          <Route path="/dashboard/hub/rules" element={<HubRules />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading data: Vertical key is missing')).toBeInTheDocument();
    });
  });

  it('shows fetch error when refresh api fails', async () => {
    vi.mocked(rulesTableApi.refreshVerticalRules).mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Error loading data: Network error')).toBeInTheDocument();
    });
  });

  it('shows generic fetch error for unknown failure', async () => {
    vi.mocked(rulesTableApi.refreshVerticalRules).mockRejectedValue('something went wrong');

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Error loading data: An error occurred')).toBeInTheDocument();
    });
  });

  it('shows no rules message when api returns only empty projects', async () => {
    vi.mocked(rulesTableApi.refreshVerticalRules).mockResolvedValue({
      vertical_key: 'v1',
      vertical_name: 'Vertical One',
      projects: [
        {
          project_key: 'proj-empty',
          project_name: 'Project Empty',
          rules: [],
        },
      ],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No rules found for this vertical.')).toBeInTheDocument();
    });
  });
});