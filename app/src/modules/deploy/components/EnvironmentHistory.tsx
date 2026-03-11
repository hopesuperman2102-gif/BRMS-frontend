
'use client';

import React from 'react';
import { Box } from '@mui/material';
import { EnvironmentHistoryProps } from '@/modules/deploy/types/deployTypes';
import { ActiveRules} from '@/modules/deploy/components/ActiveRules';

export const EnvironmentHistory: React.FC<EnvironmentHistoryProps> = ({
  rules,
  onRevoked,
  onPromoted,
  onViewLogs,
  environment,
  canManageActions,
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      <ActiveRules
        rules={rules}
        onRevoked={onRevoked}
        onPromoted={onPromoted}        
        onViewLogs={onViewLogs}
        environment={environment}
        canManageActions={canManageActions}
        delay={0.7}
      />
    </Box>
  );
};
