// app/src/modules/feature-flags/components/StatsSection.tsx

'use client';

import React from 'react';
import { Grid } from '@mui/material';
import { DashboardStats } from '../types/featureFlagTypes';
import { DeploymentHealthCard } from './Deploymenthealthcard';
import { PendingSyncsCard } from './Pendingsyncscard';
import { RuleChangesCard } from './Rulechangescard';

interface StatsSectionProps {
  stats: DashboardStats;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 3 }}>
        <DeploymentHealthCard
          title="Deployment Health"
          health={stats.deploymentHealth}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <PendingSyncsCard
          title="Active Rules"
          value={stats.activeSyncs[0].count}
          timestamp={stats.activeSyncs[1].lastSync}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <PendingSyncsCard
          title="Pending Rules"
          value={stats.pendingSyncs[0].count}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <RuleChangesCard
          changes={stats.ruleChanges}
        />
      </Grid>
    </Grid>
  );
};
