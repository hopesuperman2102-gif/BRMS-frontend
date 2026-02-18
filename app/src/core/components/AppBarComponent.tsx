"use client";

import React from 'react';
import { AppBar, Toolbar, Box } from '@mui/material';
import HeaderIcon from './HeaderIcon';
import LogoTitle from './LogoTitle';
import { brmsTheme } from '../theme/brmsTheme';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export type AppBarComponentProps = {
  logo: React.ReactNode;
  organizationName?: string;
};

const AppBarComponent: React.FC<AppBarComponentProps> = ({
  logo,
  organizationName,
}) => {
  return (
    <AppBar
      position="sticky"   // ← sticks to top on scroll
      elevation={0}
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        background: brmsTheme.gradients.primary,
        boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 2px 8px rgba(79,70,229,0.2)',
      }}
    >
      <Toolbar>
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
          <LogoTitle logo={logo} organizationName={organizationName} />
          <Box display="flex" alignItems="center" gap={1}>
            <HeaderIcon icon={<HelpOutlineIcon />} tooltip="Help" />
            <HeaderIcon icon={<SettingsIcon />} tooltip="Settings" />
            <HeaderIcon icon={<AccountCircleIcon />} tooltip="Profile" />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;