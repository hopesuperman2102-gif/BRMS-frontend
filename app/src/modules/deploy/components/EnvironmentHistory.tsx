
'use client';

import React from 'react';
import { Box } from '@mui/material';
import { EnvironmentHistoryProps } from '../types/featureFlagTypes';
import { ActiveRules} from './ActiveRules';

export const EnvironmentHistory: React.FC<EnvironmentHistoryProps> = ({
  rules,
  onRevoked,
  onViewLogs,
  environment,
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      <ActiveRules
        rules={rules}
        onRevoked={onRevoked}
        onViewLogs={onViewLogs}
        environment={environment}
        delay={0.7}
      />
    </Box>
  );
};