// app/src/modules/feature-flags/components/ControlSection.tsx

'use client';

import React from 'react';
import { Grid } from '@mui/material';
import { Environment, Rule } from '../types/featureFlagTypes';
import { RuleVersionControl } from './Ruleversioncontrol';
import { EnvironmentDeployment } from './Environmentdeployment';


interface ControlSectionProps {
  rules: Rule[];
  selectedRules: Set<string>;
  onToggleRule: (ruleId: string) => void;
  environments: Environment[];
  selectedEnvironment: Environment;
  onEnvironmentChange: (env: Environment) => void;
  onDeploy: () => void;
  lastDeployedBy?: string;
  lastDeployedTime?: string;
}

export const ControlSection: React.FC<ControlSectionProps> = ({
  rules,
  selectedRules,
  onToggleRule,
  environments,
  selectedEnvironment,
  onEnvironmentChange,
  onDeploy,
  lastDeployedBy,
  lastDeployedTime
}) => {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <RuleVersionControl
          rules={rules}
          selectedRules={selectedRules}
          onToggleRule={onToggleRule}
          delay={0.5}
        />
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <EnvironmentDeployment
          environments={environments}
          selectedEnvironment={selectedEnvironment}
          onEnvironmentChange={onEnvironmentChange}
          onDeploy={onDeploy}
          lastDeployedBy={lastDeployedBy}
          lastDeployedTime={lastDeployedTime}
          delay={0.5}
        />
      </Grid>
    </Grid>
  );
};