import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatsSection } from './Statssection';

const deploymentHealthSpy = vi.fn();
const pendingSyncSpy = vi.fn();
const monthChartSpy = vi.fn();

vi.mock('@/modules/deploy/components/DeploymentHealth', () => ({
  DeploymentHealth: (props: unknown) => {
    deploymentHealthSpy(props);
    return <div data-testid="deployment-health" />;
  },
}));

vi.mock('@/modules/deploy/components/PendingSync', () => ({
  PendingSync: (props: unknown) => {
    pendingSyncSpy(props);
    return <div data-testid="pending-sync" />;
  },
}));

vi.mock('@/core/components/RcMonthBarChart', () => ({
  __esModule: true,
  default: (props: unknown) => {
    monthChartSpy(props);
    return <div data-testid="month-chart" />;
  },
}));

describe('StatsSection', () => {
  it('renders child widgets with mapped stats', () => {
    render(
      <StatsSection
        stats={{
          totalRuleVersions: 10,
          pendingVersions: 2,
          approvedVersions: 6,
          rejectedVersions: 2,
          deployedVersions: 4,
          approvedNotDeployedVersions: 3,
          monthlyDeployments: [{ month: 1, year: 2024, total: 2 }],
        }}
        selectedYear={2024}
        onYearChange={vi.fn()}
      />,
    );

    expect(screen.getByTestId('deployment-health')).toBeInTheDocument();
    expect(screen.getAllByTestId('pending-sync')).toHaveLength(2);
    expect(screen.getByTestId('month-chart')).toBeInTheDocument();
    expect(deploymentHealthSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Deployment Health',
      health: { total: 10, pending: 2, approved: 6, rejected: 2 },
    }));
    expect(monthChartSpy).toHaveBeenCalledWith(expect.objectContaining({
      selectedYear: 2024,
      title: 'Deployed Rules',
    }));
  });
});
