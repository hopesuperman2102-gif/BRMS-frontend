"use client";

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';

type HeaderIconProps = {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
};

const HeaderIcon: React.FC<HeaderIconProps> = ({
  icon,
  tooltip,
  onClick,
}) => {
  return (
    <Tooltip title={tooltip}>
      <IconButton color="inherit" onClick={onClick}>
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export default HeaderIcon;
