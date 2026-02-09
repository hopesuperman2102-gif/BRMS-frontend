// app/src/modules/feature-flags/components/PendingSyncsCard.tsx

'use client';

import React from 'react';
import { Typography } from '@mui/material';
import { Card } from 'app/src/core/components/RcCard';

interface PendingSyncsCardProps {
  title: string;
  value: number | string;
  timestamp?: string;
  delay?: number;
}

export const PendingSyncsCard: React.FC<PendingSyncsCardProps> = ({
  title,
  value,
  timestamp,
  delay = 0.2,
}) => {
  return (
    <Card delay={delay}>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 2,
          textTransform: 'uppercase',
          color: 'text.secondary',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="h2"
        sx={{
          fontWeight: 700,
          textAlign: 'center',
          mt: timestamp ? 2 : 4,
        }}
      >
        {value}
      </Typography>

      {timestamp && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: 'center', display: 'block', mt: 1 }}
        >
          {timestamp}
        </Typography>
      )}
    </Card>
  );
};
