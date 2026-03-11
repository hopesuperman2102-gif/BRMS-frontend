
'use client';

import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { EnvironmentHistoryProps } from '@/modules/deploy/types/deployTypes';
import { ActiveRules } from '@/modules/deploy/components/ActiveRules';

const Root = styled(Box)({
  marginTop: 24,
});

export const EnvironmentHistory: React.FC<EnvironmentHistoryProps> = ({
  rules,
  onRevoked,
  onPromoted,
  onViewLogs,
  environment,
  canManageActions,
}) => {
  return (
    <Root>
      <ActiveRules
        rules={rules}
        onRevoked={onRevoked}
        onPromoted={onPromoted}
        onViewLogs={onViewLogs}
        environment={environment}
        canManageActions={canManageActions}
        delay={0.7}
      />
    </Root>
  );
};
