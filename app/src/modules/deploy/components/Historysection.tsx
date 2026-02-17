// app/src/modules/feature-flags/components/HistorySection.tsx

'use client';

import React from 'react';
import { Box } from '@mui/material';
import { DeployedRule } from '../types/featureFlagTypes';
import { ActiveRulesTable } from './Activerulestable';

interface HistorySectionProps {
  rules: DeployedRule[];
  onRollback: (ruleKey: string) => void;
  onViewLogs: (ruleKey: string) => void;
  environment: string;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  rules,
  onRollback,
  onViewLogs,
  environment,
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      <ActiveRulesTable
        rules={rules}
        onRollback={onRollback}
        onViewLogs={onViewLogs}
        environment={environment}
        delay={0.7}
      />
    </Box>
  );
};