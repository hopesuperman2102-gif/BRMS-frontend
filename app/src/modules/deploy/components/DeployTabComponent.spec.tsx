import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeployTabComponent from './DeployTabComponent';

const { getDashboardSummary, getDashboardStats, deployRule, showAlert } = vi.hoisted(() => ({
  getDashboardSummary: vi.fn(),
  getDashboardStats: vi.fn(),
  deployRule: vi.fn(),
  showAlert: vi.fn(),
}));

let roleState = { isSuperAdmin: false };

vi.mock('react-router-dom', () => ({
  useParams: () => ({ vertical_Key: 'vertical-1' }),
}));

vi.mock('@/modules/deploy/api/deployApi', () => ({
  deployApi: {
    getDashboardSummary,
    getDashboardStats,
    deployRule,
  },
}));

vi.mock('@/modules/auth/hooks/useRole', () => ({
  useRole: () => roleState,
}));

vi.mock('@/core/components/RcAlertComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="alert-component" />,
  useAlertStore: () => ({ showAlert }),
}));

vi.mock('@/modules/deploy/components/DeployHeader', () => ({
  DeployHeader: ({
    totalRules,
    selectedProject,
    onProjectSelect,
    onEnvironmentClick,
  }: {
    totalRules: number;
    selectedProject: string;
    onProjectSelect: (value: string) => void;
    onEnvironmentClick: (value: 'ALL' | 'DEV' | 'QA' | 'PROD') => void;
  }) => (
    <div>
      <div>total:{totalRules}</div>
      <div>project:{selectedProject}</div>
      <button type="button" onClick={() => onProjectSelect('Project B')}>project-b</button>
      <button type="button" onClick={() => onEnvironmentClick('QA')}>env-qa</button>
    </div>
  ),
}));

vi.mock('@/modules/deploy/components/Statssection', () => ({
  StatsSection: ({ stats }: { stats: { totalRuleVersions: number } }) => <div>stats:{stats.totalRuleVersions}</div>,
}));

vi.mock('@/modules/deploy/components/Controlsection', () => ({
  ControlSection: ({
    selectedEnvironment,
    onEnvironmentChange,
    onDeploy,
    onToggleRule,
    onVersionChange,
    canDeploy,
  }: {
    selectedEnvironment: string;
    onEnvironmentChange: (env: 'DEV' | 'QA' | 'PROD') => void;
    onDeploy: () => void;
    onToggleRule: (rule: string) => void;
    onVersionChange: (rule: string, version: string) => void;
    canDeploy: boolean;
  }) => (
    <div>
      <div>deploy-env:{selectedEnvironment}</div>
      <div>can-deploy:{String(canDeploy)}</div>
      <button type="button" onClick={() => onEnvironmentChange('PROD')}>target-prod</button>
      <button type="button" onClick={() => onToggleRule('rule-1')}>toggle-rule</button>
      <button type="button" onClick={() => onVersionChange('rule-1', 'v2')}>set-version</button>
      <button type="button" onClick={onDeploy}>deploy-now</button>
    </div>
  ),
}));

vi.mock('@/modules/deploy/components/EnvironmentHistory', () => ({
  EnvironmentHistory: ({
    environment,
    onRevoked,
    onPromoted,
    onViewLogs,
  }: {
    environment: string;
    onRevoked: () => void;
    onPromoted: (env: string) => void;
    onViewLogs: () => void;
  }) => (
    <div>
      <div>history-env:{environment}</div>
      <button type="button" onClick={onRevoked}>revoked</button>
      <button type="button" onClick={() => onPromoted('PROD')}>promoted</button>
      <button type="button" onClick={onViewLogs}>view-logs</button>
    </div>
  ),
}));

vi.mock('@/modules/deploy/components/EnvironmentLogs', () => ({
  EnvironmentLogs: ({
    open,
    environment,
    onClose,
  }: {
    open: boolean;
    environment: string;
    onClose: () => void;
  }) => (
    <div>
      <div>logs-open:{String(open)}</div>
      <div>logs-env:{environment}</div>
      <button type="button" onClick={onClose}>close-logs</button>
    </div>
  ),
}));

describe('DeployTabComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    roleState = { isSuperAdmin: false };
    getDashboardSummary.mockResolvedValue({
      total_active_rules: 12,
      active_projects: [
        { project_name: 'Project A', project_key: 'project-a' },
        { project_name: 'Project B', project_key: 'project-b' },
      ],
    });
    getDashboardStats.mockResolvedValue({
      total_rule_versions: 9,
      pending_versions: 1,
      approved_versions: 5,
      rejected_versions: 3,
      deployed_versions: 4,
      approved_not_deployed_versions: 2,
      monthly_deployments: [],
      undeployed_approved_versions: [
        { rule_key: 'rule-1', rule_name: 'Rule One', version: 'v1' },
      ],
      deployed_rules: [
        { rule_key: 'rule-2', rule_name: 'Rule Two', version: 'v5', environment: 'DEV', deployable_env: ['QA'] },
      ],
    });
    deployRule.mockResolvedValue({});
  });

  it('loads summary and stats on mount', async () => {
    render(<DeployTabComponent />);

    expect(await screen.findByText('total:12')).toBeInTheDocument();
    expect(await screen.findByText('project:Project A')).toBeInTheDocument();
    expect(await screen.findByText('stats:9')).toBeInTheDocument();
    expect(getDashboardSummary).toHaveBeenCalledWith('vertical-1');
    expect(getDashboardStats).toHaveBeenCalledWith('project-a', 'ALL');
  });

  it('changes project and environment and opens logs', async () => {
    render(<DeployTabComponent />);
    await screen.findByText('project:Project A');

    fireEvent.click(screen.getByText('project-b'));
    fireEvent.click(screen.getByText('env-qa'));
    fireEvent.click(screen.getByText('view-logs'));

    await waitFor(() => {
      expect(getDashboardStats).toHaveBeenCalledWith('project-b', 'QA');
    });
    expect(screen.getByText('logs-open:true')).toBeInTheDocument();
    expect(screen.getByText('logs-env:QA')).toBeInTheDocument();

    fireEvent.click(screen.getByText('close-logs'));
    expect(screen.getByText('logs-open:false')).toBeInTheDocument();
  });

  it('shows warnings for invalid deploy attempts', async () => {
    roleState = { isSuperAdmin: true };
    render(<DeployTabComponent />);
    await screen.findByText('project:Project A');

    fireEvent.click(screen.getByText('deploy-now'));
    expect(showAlert).toHaveBeenCalledWith('Please select at least one rule to deploy.', 'warning');

    fireEvent.click(screen.getByText('toggle-rule'));
    fireEvent.click(screen.getByText('deploy-now'));
    expect(showAlert).toHaveBeenCalledWith('Please select a version for all checked rules before deploying.', 'warning');
  });

  it('deploys selected rules and refreshes stats', async () => {
    roleState = { isSuperAdmin: true };
    render(<DeployTabComponent />);
    await screen.findByText('project:Project A');

    fireEvent.click(screen.getByText('target-prod'));
    fireEvent.click(screen.getByText('toggle-rule'));
    fireEvent.click(screen.getByText('set-version'));
    fireEvent.click(screen.getByText('deploy-now'));

    await waitFor(() => {
      expect(deployRule).toHaveBeenCalledWith({
        rule_key: 'rule-1',
        version: 'v2',
        environment: 'PROD',
        activated_by: 'admin',
      });
    });
    expect(showAlert).toHaveBeenCalledWith('Successfully deployed 1 rule(s) to PROD', 'success');
  });

  it('shows success alerts for revoke and promote callbacks', async () => {
    render(<DeployTabComponent />);
    await screen.findByText('project:Project A');

    fireEvent.click(screen.getByText('revoked'));
    fireEvent.click(screen.getByText('promoted'));

    await waitFor(() => {
      expect(showAlert).toHaveBeenCalledWith('Rule revoked successfully.', 'success');
      expect(showAlert).toHaveBeenCalledWith('Rule promoted to PROD successfully.', 'success');
    });
  });

  it('shows permission alert when user cannot deploy', async () => {
    roleState = { isSuperAdmin: false };
    render(<DeployTabComponent />);
    await screen.findByText('project:Project A');

    fireEvent.click(screen.getByText('toggle-rule'));
    fireEvent.click(screen.getByText('set-version'));
    fireEvent.click(screen.getByText('deploy-now'));

    expect(showAlert).toHaveBeenCalledWith('You do not have permission to deploy rules.', 'info');
  });

  it('shows error alert when deployment fails', async () => {
    roleState = { isSuperAdmin: true };
    deployRule.mockRejectedValueOnce(new Error('deploy failed'));
    render(<DeployTabComponent />);
    await screen.findByText('project:Project A');

    fireEvent.click(screen.getByText('toggle-rule'));
    fireEvent.click(screen.getByText('set-version'));
    fireEvent.click(screen.getByText('deploy-now'));

    await waitFor(() => {
      expect(showAlert).toHaveBeenCalledWith('Deployment failed: deploy failed', 'error');
    });
  });

  it('handles stats fetch failure', async () => {
    getDashboardStats.mockRejectedValueOnce(new Error('stats failed'));
    render(<DeployTabComponent />);

    expect(await screen.findByText('project:Project A')).toBeInTheDocument();
    await waitFor(() => expect(getDashboardStats).toHaveBeenCalled());
  });
});