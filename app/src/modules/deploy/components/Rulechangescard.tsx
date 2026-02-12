// app/src/modules/feature-flags/components/RuleChangesCard.tsx

'use client';

import React from 'react';
import { Typography } from '@mui/material';
import { RuleChange } from '../types/featureFlagTypes';
import { RcCard } from 'app/src/core/components/RcCard';
import { BarChart } from 'app/src/core/components/RcBarChart';


interface RuleChangesCardProps {
  changes: RuleChange[];
  delay?: number;
}

export const RuleChangesCard: React.FC<RuleChangesCardProps> = ({
  changes,
  delay = 0.4
}) => {
  return (
    <RcCard delay={delay}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          mb: 2, 
          textTransform: 'uppercase', 
          color: 'text.secondary',
          fontWeight: 600,
          letterSpacing: '0.05em'
        }}
      >
        Rule Changes (24H)
      </Typography>
      <BarChart data={changes} height={96} />
    </RcCard>
  );
};