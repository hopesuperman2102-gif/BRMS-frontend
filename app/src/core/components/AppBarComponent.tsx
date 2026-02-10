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
      position="static" 
      elevation={0}
      sx={{
        background: brmsTheme.gradients.primary,
        boxShadow: '0 2px 8px rgba(101, 82, 208, 0.2)',
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
