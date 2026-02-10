// app/src/modules/feature-flags/components/ui/Badge.tsx

'use client';

import React from 'react';
import { Chip, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { RuleStatus, DeploymentStatus } from 'app/src/modules/dashboard/deploy/types/featureFlagTypes';

type StatusKey = RuleStatus | DeploymentStatus | 'veatus';

interface BadgeProps {
  status: RuleStatus | DeploymentStatus;
  label?: string;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, showDot = false }) => {
  const styles: Record<StatusKey, { bgcolor: string; color: string }> = {
    active: { bgcolor: 'success.light', color: 'success.dark' },
    inactive: { bgcolor: 'grey.200', color: 'grey.700' },
    pending: { bgcolor: 'warning.light', color: 'warning.dark' },
    veatus: { bgcolor: 'grey.300', color: 'grey.700' },
  };

  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Chip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {showDot && status === 'pending' && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'warning.main',
                animation: 'pulse 2s infinite'
              }}
            />
          )}
          {status === 'active' && <CheckCircleIcon sx={{ fontSize: 16 }} />}
          {displayLabel}
        </Box>
      }
      size="small"
      sx={{
        ...styles[status],
        fontWeight: 600,
        fontSize: '0.75rem',
        borderRadius: 2
      }}
    />
  );
};