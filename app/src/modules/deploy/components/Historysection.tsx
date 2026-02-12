// app/src/modules/feature-flags/components/HistorySection.tsx

'use client';

import React from 'react';
import { Box } from '@mui/material';
import { DeploymentHistory } from '../types/featureFlagTypes';
import { ActiveRulesTable } from './Activerulestable';


interface HistorySectionProps {
  rules: DeploymentHistory[];
  selectedRules: Set<string>;
  onToggleRule: (ruleId: string) => void;
  onRollback: (ruleId: string) => void;
  onViewLogs: (ruleId: string) => void;
  environment: string;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  rules,
  selectedRules,
  onToggleRule,
  onRollback,
  onViewLogs,
  environment
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      <ActiveRulesTable
        rules={rules}
        selectedRules={selectedRules}
        onToggleRule={onToggleRule}
        onRollback={onRollback}
        onViewLogs={onViewLogs}
        environment={environment}
        delay={0.7}
      />
    </Box>
  );
};