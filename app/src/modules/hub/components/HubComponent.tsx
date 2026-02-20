'use client';

import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, IconButton, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ProjectList from './ProjectList';
import RulesTable from './RulesTable';
import DeployTabPage from '../../deploy/page/DeployTabPage';
import { projectsApi } from 'app/src/modules/hub/api/projectsApi';

const HubComponent: React.FC = () => {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const { vertical_Key } = useParams();
  const [verticalName, setVerticalName] = useState<string>('');

  useEffect(() => {
    if (!vertical_Key) return;
    const controller = new AbortController();

    const fetchVerticalName = async () => {
      try {
        const data = await projectsApi.getVerticalProjects(vertical_Key);
        if (!controller.signal.aborted) {
          setVerticalName(data.vertical_name);
        }
      } catch (error: any) {
        if (!controller.signal.aborted) {
          console.error('Error fetching vertical:', error);
        }
      }
    };

    fetchVerticalName();
    return () => controller.abort();
  }, [vertical_Key]);

  // Invalidate cache + switch tab
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (vertical_Key) {
      projectsApi.invalidateProjectsCache(vertical_Key); // force fresh API on next mount
    }
    setTab(newValue);
  };

  return (
    <>
      <Box px={3} pt={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <IconButton
            onClick={() => navigate(`/vertical/${vertical_Key}/dashboard`)}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: 'rgba(101, 82, 208, 0.08)',
              color: '#6552D0',
              transition: 'all 0.2s',
              flexShrink: 0,
              '&:hover': {
                backgroundColor: 'rgba(101, 82, 208, 0.15)',
                transform: 'translateX(-2px)',
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {verticalName && (
            <Typography
              sx={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#374151',
                whiteSpace: 'nowrap',
              }}
            >
              {verticalName}
            </Typography>
          )}
        </Box>

        <Tabs
          value={tab}
          onChange={handleTabChange}
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
              '&.Mui-selected': { color: '#6552D0' },
              '&:hover': { color: '#6552D0' },
            },
          }}
        >
          <Tab label="Projects" />
          <Tab label="Rules" />
          <Tab label="Deploy" />
        </Tabs>
      </Box>

      <Box p={3}>
        {tab === 0 && <ProjectList />}
        {tab === 1 && <RulesTable />}
        {tab === 2 && <DeployTabPage />}
      </Box>
    </>
  );
};

export default HubComponent;