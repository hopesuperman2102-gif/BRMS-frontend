// app/src/modules/feature-flags/components/EnvironmentDeployment.tsx

'use client';
 
import React from 'react';
import { Button, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { motion } from 'framer-motion';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { Environment } from '../types/featureFlagTypes';
import { RcCard, CardHeader } from 'app/src/core/components/RcCard';


interface EnvironmentDeploymentProps {
  environments: Environment[];
  selectedEnvironment: Environment;
  onEnvironmentChange: (env: Environment) => void;
  onDeploy: () => void;
  lastDeployedBy?: string;
  lastDeployedTime?: string;
  delay?: number;
}

export const EnvironmentDeployment: React.FC<EnvironmentDeploymentProps> = ({
  environments,
  selectedEnvironment,
  onEnvironmentChange,
  onDeploy,
  lastDeployedBy = 'John Doe',
  lastDeployedTime = '2m ago',
  delay = 0.5
}) => {
  return (
    <RcCard delay={delay}>
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
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }
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
            background: 'linear-gradient(135deg, #6552D0 0%, #17203D 100%)',
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
              background: 'linear-gradient(135deg, #5443B8 0%, #14192F 100%)',
            }
          }}
        >
          Deploy to {selectedEnvironment}
        </Button>
      </motion.div>

      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
        Last deployed <strong>{lastDeployedTime}</strong> by <strong>{lastDeployedBy}</strong>
      </Typography>
    </RcCard>
  );
};