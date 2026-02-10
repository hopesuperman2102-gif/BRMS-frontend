'use client';

import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import ProjectList from '../../../core/components/ProjectList';
import DeployTab from 'app/src/core/components/DeployTab';
import RulesTable from './RulesTable';
import FeatureFlagComponent from '../deploy/components/Featureflagcomponent';

const DashboardComponent: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <>

      {/* Tabs below AppBar */}
      <Box px={3} pt={2}>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          sx={{
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(135deg, #6552D0 0%, #17203D 100%)',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#64748b',
              '&.Mui-selected': {
                color: '#6552D0',
              },
              '&:hover': {
                color: '#6552D0',
              },
            },
          }}
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
          <RulesTable/>
          )}

        {tab === 2 && (
          <FeatureFlagComponent />
        )}
      </Box>
    </>
  );
};

export default DashboardComponent;

