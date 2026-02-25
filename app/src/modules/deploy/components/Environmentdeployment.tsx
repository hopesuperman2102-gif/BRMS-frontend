// app/src/modules/feature-flags/components/EnvironmentDeployment.tsx

'use client';

import React from 'react';
import { Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { motion } from 'framer-motion';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { EnvironmentDeploymentProps } from '../types/featureFlagTypes';
import { RcCard, CardHeader } from 'app/src/core/components/RcCard';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';

export const EnvironmentDeployment: React.FC<EnvironmentDeploymentProps> = ({
  environments,
  selectedEnvironment,
  onEnvironmentChange,
  onDeploy,
  delay = 0.5,
  sx,
}) => {
  return (
    <RcCard delay={delay} sx={sx}>
      <CardHeader title="Environment & Deployment Action" />

      <ToggleButtonGroup
        value={selectedEnvironment}
        exclusive
        onChange={(_, newEnv) => newEnv && onEnvironmentChange(newEnv)}
        fullWidth
        sx={{ mb: 4 }}
      >
        {environments.map((env) => (
          <ToggleButton
            key={env}
            value={env}
            sx={{
              py: 1.5,
              fontWeight: 700,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              },
            }}
          >
            {env}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<RocketLaunchIcon />}
          onClick={onDeploy}
          sx={{
            py: 2.5,
            fontSize: '1.1rem',
            fontWeight: 700,
            background: brmsTheme.gradients.primary,
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
              background: brmsTheme.gradients.primaryHover,
            },
          }}
        >
          Deploy to {selectedEnvironment}
        </Button>
      </motion.div>
    </RcCard>
  );
};