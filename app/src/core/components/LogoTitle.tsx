"use client";

import React from 'react';
import { Box, Typography } from '@mui/material';

type LogoTitleProps = {
  logo: React.ReactNode;
  organizationName?: string;
};

const LogoTitle: React.FC<LogoTitleProps> = ({
  logo,
  organizationName,
}) => {
  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      {logo}
      <Typography variant="h6" fontWeight={600}>
        {organizationName}
      </Typography>
    </Box>
  );
};

export default LogoTitle;
