'use client';

import React from 'react';
import { Grid } from '@mui/material';
import { DeploymentHealthCard } from './Deploymenthealthcard';
import { PendingSyncsCard } from './Pendingsyncscard';
import { MonthlyData } from '../api/deployApi';
import RcMonthBarChart from 'app/src/core/components/RcMonthBarChart';

interface StatsSectionProps {
  stats: {
    totalRuleVersions: number;
    pendingVersions: number;
    approvedVersions: number;
    rejectedVersions: number;
    deployedVersions: number;
    approvedNotDeployedVersions: number;
    monthlyDeployments: MonthlyData[];
  };
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats, selectedYear, onYearChange }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 3 }}>
        <DeploymentHealthCard
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
        <PendingSyncsCard
          title="Active Rules"
          value={stats.deployedVersions}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 2 }}>
        <PendingSyncsCard
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
          barColors={["#1976d2", "#2196f3", "#42a5f5"]}
        />
      </Grid>
    </Grid>
  );
};