"use client";

import React from 'react';
import { Box, Typography } from '@mui/material';
import { LogoTitleProps } from '../types/commonTypes';

const LogoTitle: React.FC<LogoTitleProps> = ({
  logo,
  organizationName,
}) => {
  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      {logo}
      <Typography 
        variant="h6" 
        sx={{
          fontWeight: 700,
          color: 'white',
          letterSpacing: '0.05em',
        }}
      >
        {organizationName}
      </Typography>
    </Box>
  );
};

export default LogoTitle;
