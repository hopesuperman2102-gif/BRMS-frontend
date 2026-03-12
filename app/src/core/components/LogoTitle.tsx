"use client";

import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import { LogoTitleProps } from '@/core/types/commonTypes';

const StyledTypography = styled(Typography)({
  fontWeight: 700,
  color: 'white',
  letterSpacing: '0.05em',
});

const LogoTitle: React.FC<LogoTitleProps> = ({
  logo,
  organizationName,
}) => {
  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      {logo}
      <StyledTypography variant="h6">
        {organizationName}
      </StyledTypography>
    </Box>
  );
};

export default LogoTitle;