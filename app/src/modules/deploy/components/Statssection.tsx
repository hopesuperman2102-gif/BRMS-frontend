'use client';

import React from 'react';
import { Grid } from '@mui/material';
import { DeploymentHealth } from '@/modules/deploy/components/DeploymentHealth';
import { PendingSync } from '@/modules/deploy/components/PendingSync';
import RcMonthBarChart from '@/core/components/RcMonthBarChart';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { StatsSectionProps } from '@/modules/deploy/types/deployTypes';

export const StatsSection: React.FC<StatsSectionProps> = ({ stats, selectedYear, onYearChange }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 3 }}>
        <DeploymentHealth
          title="Deployment Health"
          health={{
            total: stats.totalRuleVersions,
            pending: stats.pendingVersions,
            approved: stats.approvedVersions,
            rejected: stats.rejectedVersions,
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 2 }}>
        <PendingSync
          title="Active Rules"
          value={stats.deployedVersions}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 2 }}>
        <PendingSync
          title="Pending Rules"
          value={stats.approvedNotDeployedVersions}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <RcMonthBarChart
          data={stats.monthlyDeployments}
          selectedYear={selectedYear}
          onYearChange={onYearChange}
          title="Deployed Rules"
          subtitle="Cumulative deployment statistics"
          height={170}
          tooltipSuffix="deployments"
          barColors={[brmsTheme.colors.info, brmsTheme.colors.chartBlue2, brmsTheme.colors.chartBlue3]}
        />
      </Grid>
    </Grid>
  );
};

