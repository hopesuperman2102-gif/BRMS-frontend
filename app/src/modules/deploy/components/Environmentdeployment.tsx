'use client';

import React from 'react';
import { Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { EnvironmentDeploymentProps } from '@/modules/deploy/types/deployTypes';
import { RcCard, CardHeader } from '@/core/components/RcCard';
import { brmsTheme } from '@/core/theme/brmsTheme';

const DeploymentCard = styled(RcCard)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
});

const EnvironmentToggleGroup = styled(ToggleButtonGroup)({
  marginBottom: 32,
});

const EnvironmentToggleButton = styled(ToggleButton)({
  paddingTop: 12,
  paddingBottom: 12,
  fontWeight: 700,
  '&.Mui-selected': {
    backgroundColor: brmsTheme.colors.primary,
    color: 'white',
    '&:hover': {
      backgroundColor: brmsTheme.colors.primaryHover,
    },
  },
});

const DeployButton = styled(Button)({
  paddingTop: 20,
  paddingBottom: 20,
  fontSize: '1.1rem',
  fontWeight: 700,
  background: brmsTheme.gradients.primary,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
    background: brmsTheme.gradients.primaryHover,
  },
});

export const EnvironmentDeployment: React.FC<EnvironmentDeploymentProps> = ({
  environments,
  selectedEnvironment,
  onEnvironmentChange,
  onDeploy,
  canDeploy = true,
  delay = 0.5,
}) => {
  return (
    <DeploymentCard delay={delay}>
      <CardHeader title="Environment & Deployment Action" />

      <EnvironmentToggleGroup
        value={selectedEnvironment}
        exclusive
        onChange={(_, newEnv) => newEnv && onEnvironmentChange(newEnv)}
        fullWidth
      >
        {environments.map((env) => (
          <EnvironmentToggleButton key={env} value={env}>
            {env}
          </EnvironmentToggleButton>
        ))}
      </EnvironmentToggleGroup>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <DeployButton
          variant="contained"
          fullWidth
          size="large"
          startIcon={<RocketLaunchIcon />}
          onClick={onDeploy}
          disabled={!canDeploy}
        >
          Deploy to {selectedEnvironment}
        </DeployButton>
      </motion.div>
    </DeploymentCard>
  );
};
