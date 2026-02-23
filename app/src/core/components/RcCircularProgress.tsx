// app/src/modules/feature-flags/components/ui/CircularProgress.tsx

'use client';

import React from 'react';
import { Box, Typography, CircularProgress as MuiCircularProgress } from '@mui/material';
import { CircularProgressProps } from '../types/commonTypes';

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 128,
  thickness = 4,
  label,
  sublabel = 'Success'
}) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', mx: 'auto' }}>
      {/* Background circle */}
      <MuiCircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{ color: 'error.light', position: 'absolute' }}
      />
      {/* Progress circle */}
      <MuiCircularProgress
        variant="determinate"
        value={percentage}
        size={size}
        thickness={thickness}
        sx={{ color: 'primary.main' }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <Typography variant="h4" component="div" fontWeight={700} color="text.primary">
          {label || `${percentage}%`}
        </Typography>
        <Typography variant="caption" color="text.secondary" textTransform="uppercase">
          {sublabel}
        </Typography>
      </Box>
    </Box>
  );
};