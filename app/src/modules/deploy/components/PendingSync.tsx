'use client';

import React from 'react';
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { RcCard } from '@/core/components/RcCard';
import { PendingSyncProps } from '@/modules/deploy/types/deployTypes';

const CardTitle = styled(Typography)({
  marginBottom: 16,
  textTransform: 'uppercase',
  color: 'text.secondary',
  fontWeight: 600,
  letterSpacing: '0.05em',
});

const CardValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'hasTimestamp',
})<{ hasTimestamp: boolean }>(({ hasTimestamp }) => ({
  fontWeight: 700,
  textAlign: 'center',
  marginTop: hasTimestamp ? 16 : 32,
}));

const TimestampText = styled(Typography)({
  textAlign: 'center',
  display: 'block',
  marginTop: 8,
});

export const PendingSync: React.FC<PendingSyncProps> = ({
  title,
  value,
  timestamp,
  delay = 0.2,
}) => {
  return (
    <RcCard delay={delay}>
      <CardTitle variant="subtitle2">{title}</CardTitle>

      <CardValue variant="h2" hasTimestamp={Boolean(timestamp)}>
        {value}
      </CardValue>

      {timestamp && (
        <TimestampText variant="caption" color="text.secondary">
          {timestamp}
        </TimestampText>
      )}
    </RcCard>
  );
};

