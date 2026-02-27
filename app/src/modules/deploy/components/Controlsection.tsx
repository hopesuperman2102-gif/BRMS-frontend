'use client';

import React from 'react';
import { Grid } from '@mui/material';
import { ControlSectionProps } from '../types/featureFlagTypes';
import { EnvironmentDeployment } from './Environmentdeployment';
import { RuleVersionControl } from './Ruleversioncontrol';


export const ControlSection: React.FC<ControlSectionProps> = ({
  rules,
  selectedRules,
  selectedVersions,
  onToggleRule,
  onVersionChange,
  environments,
  selectedEnvironment,
  onEnvironmentChange,
  onDeploy,
  lastDeployedBy,
  lastDeployedTime,
  isLoading,
}) => {
  return (
    // alignItems="stretch" makes both grid cells the same height as the taller one
    <Grid container spacing={3} alignItems="stretch">
      <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
        <RuleVersionControl
          rules={rules}
          selectedRules={selectedRules}
          selectedVersions={selectedVersions}
          onToggleRule={onToggleRule}
          onVersionChange={onVersionChange}
          delay={0.5}
          isLoading={isLoading}
          // fills the grid cell height
          sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
        <EnvironmentDeployment
          environments={environments}
          selectedEnvironment={selectedEnvironment}
          onEnvironmentChange={onEnvironmentChange}
          onDeploy={onDeploy}
          lastDeployedBy={lastDeployedBy}
          lastDeployedTime={lastDeployedTime}
          delay={0.5}
          sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}
        />
      </Grid>
    </Grid>
  );
};