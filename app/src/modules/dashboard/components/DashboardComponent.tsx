'use client';

import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import AppBarComponent from '../../../core/components/AppBarComponent';
import ProjectList from '../../../core/components/ProjectList';

const DashboardComponent: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <>
      <AppBarComponent
        logo={<img src="/logo.svg" height={32} alt="logo" />}
        organizationName="Business Rules Management"
      />

      {/* Tabs below AppBar */}
      <Box px={3} pt={2}>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
        >
          <Tab label="My Projects" />
          <Tab label="Rules" />
          <Tab label="Deploy" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box p={3}>
        {tab === 0 && <ProjectList />}

        {tab === 1 && (
          <Box>Rules content coming soon</Box>
        )}

        {tab === 2 && (
          <Box>Deploy content coming soon</Box>
        )}
      </Box>
    </>
  );
};

export default DashboardComponent;

