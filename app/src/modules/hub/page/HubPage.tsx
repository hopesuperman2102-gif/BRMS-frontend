'use client';

import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeployTabPage from '../../deploy/page/DeployTabPage';
import { projectsApi } from 'app/src/modules/hub/api/projectsApi';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import ProjectList from '../components/ProjectList';
import RulesTable from '../components/RulesTable';

const { colors, gradients } = brmsTheme;

/* ─── Styled Components ───────────────────────────────────── */

const HeaderWrapper = styled(Box)({
  paddingLeft: '24px',
  paddingRight: '24px',
  paddingTop: '16px',
});

const BackRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
});

const BackButton = styled(IconButton)({
  width: 36,
  height: 36,
  borderRadius: '10px',
  backgroundColor: colors.primaryGlowSoft,
  color: colors.primary,
  transition: 'all 0.2s',
  flexShrink: 0,
  '&:hover': {
    backgroundColor: colors.primaryGlowMid,
    transform: 'translateX(-2px)',
  },
});

const VerticalName = styled(Typography)({
  fontSize: '0.95rem',
  fontWeight: 600,
  color: colors.navTextHigh,
  whiteSpace: 'nowrap',
});

const StyledTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    background: gradients.primary,
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    color: colors.tabTextInactive,
    '&.Mui-selected': { color: colors.primary },
    '&:hover': { color: colors.primary },
  },
});

const ContentWrapper = styled(Box)({
  padding: '24px',
});

/* ─── Component ───────────────────────────────────────────── */

const HubPage = () => {
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
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          console.error('Error fetching vertical:', error);
        }
      }
    };

    fetchVerticalName();
    return () => controller.abort();
  }, [vertical_Key]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (vertical_Key) {
      projectsApi.invalidateProjectsCache(vertical_Key);
    }
    setTab(newValue);
  };

  return (
    <>
      <HeaderWrapper>
        <BackRow>
          <BackButton onClick={() => navigate(`/vertical/${vertical_Key}/dashboard`)}>
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </BackButton>

          {verticalName && (
            <VerticalName>{verticalName}</VerticalName>
          )}
        </BackRow>

        <StyledTabs value={tab} onChange={handleTabChange}>
          <Tab label="Projects" />
          <Tab label="Rules" />
          <Tab label="Deploy" />
        </StyledTabs>
      </HeaderWrapper>

      <ContentWrapper>
        {tab === 0 && <ProjectList />}
        {tab === 1 && <RulesTable />}
        {tab === 2 && <DeployTabPage />}
      </ContentWrapper>
    </>
  );
};

export default HubPage;