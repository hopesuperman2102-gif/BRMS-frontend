'use client';

import React from 'react';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ControlSectionProps } from '@/modules/deploy/types/deployTypes';
import { EnvironmentDeployment } from '@/modules/deploy/components/Environmentdeployment';
import { RuleVersionControl } from '@/modules/deploy/components/Ruleversioncontrol';

const StretchGridItem = styled(Grid)({
  display: 'flex',
});

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
  canDeploy,
  lastDeployedBy,
  lastDeployedTime,
  isLoading,
}) => {
  return (
    <Grid container spacing={3} alignItems="stretch">
      <StretchGridItem size={{ xs: 12, md: 6 }}>
        <RuleVersionControl
          rules={rules}
          selectedRules={selectedRules}
          selectedVersions={selectedVersions}
          onToggleRule={onToggleRule}
          onVersionChange={onVersionChange}
          delay={0.5}
          isLoading={isLoading}
        />
      </StretchGridItem>

      <StretchGridItem size={{ xs: 12, md: 6 }}>
        <EnvironmentDeployment
          environments={environments}
          selectedEnvironment={selectedEnvironment}
          onEnvironmentChange={onEnvironmentChange}
          onDeploy={onDeploy}
          canDeploy={canDeploy}
          lastDeployedBy={lastDeployedBy}
          lastDeployedTime={lastDeployedTime}
          delay={0.5}
        />
      </StretchGridItem>
    </Grid>
  );
};
