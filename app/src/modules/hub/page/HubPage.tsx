'use client';

import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeployTabPage from '@/modules/deploy/page/DeployTabPage';
import { projectsApi } from '@/modules/hub/api/projectsApi';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { useRole } from '@/modules/auth/hooks/useRole';
import HubProjects from '@/modules/hub/components/HubProjects';
import HubRules from '@/modules/hub/components/HubRules';

const { colors, gradients } = brmsTheme;

const HeaderWrapper = styled(Box)({
  padding: '8px 12px 6px',
  paddingBottom: '8px',
});

const BackRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '10px',
});

const BackButton = styled(IconButton)({
  width: 32, height: 32, borderRadius: '8px',
  background: colors.white,
  border: `1px solid ${colors.lightBorder}`,
  color: colors.lightTextMid,
  transition: 'all 0.15s',
  '&:hover': {
    background: colors.primaryGlowSoft,
    color: colors.primary,
    borderColor: colors.primaryGlowMid,
  },
});

const VerticalName = styled(Typography)({
  fontSize: '0.9rem',
  fontWeight: 600,
  color: brmsTheme.colors.textGray,
  whiteSpace: 'nowrap',
});

const StyledTabs = styled(Tabs)({
  minHeight: 0,
  padding: '4px',
  borderRadius: '5px',
  background: 'linear-gradient(180deg, rgba(248,250,252,0.9) 0%, rgba(241,245,249,0.9) 100%)',
  border: `1px solid ${colors.lightBorder}`,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .MuiTab-root': {
    minHeight: 34,
    padding: '6px 14px',
    borderRadius: '9px',
    textTransform: 'none',
    fontWeight: 700,
    fontSize: '0.86rem',
    letterSpacing: '0.01em',
    color: colors.tabTextInactive,
    transition: 'all 0.18s ease',
    '&.Mui-selected': {
      color: colors.white,
      background: gradients.primary,
      boxShadow: brmsTheme.shadows.primarySoft,
    },
    '&:hover': {
      color: colors.primary,
      backgroundColor: 'rgba(101, 82, 208, 0.08)',
    },
  },
});

const ContentWrapper = styled(Box)({
  padding: '10px 12px 14px',
});

const HubPage = () => {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const { vertical_Key } = useParams();
  const [verticalName, setVerticalName] = useState<string>('');
  const { isRuleAuthor, isReviewer, isViewer } = useRole();

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

  const visibleTabs = isRuleAuthor || isViewer
    ? [{ label: 'Projects', content: <HubProjects /> }]
    : isReviewer
    ? [
        { label: 'Projects', content: <HubProjects /> },
        { label: 'Rules', content: <HubRules /> },
      ]
    : [
        { label: 'Projects', content: <HubProjects /> },
        { label: 'Rules', content: <HubRules /> },
        { label: 'Deploy', content: <DeployTabPage /> },
      ];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (vertical_Key) {
      projectsApi.invalidateProjectsCache(vertical_Key);
    }
    setTab(newValue);
  };

  const safeTab = tab < visibleTabs.length ? tab : 0;

  return (
    <>
      <HeaderWrapper>
        <BackRow>
          <BackButton onClick={() => navigate(`/vertical/${vertical_Key}/dashboard`)}>
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </BackButton>
          {verticalName && <VerticalName>{verticalName}</VerticalName>}
        </BackRow>

        <StyledTabs value={safeTab} onChange={handleTabChange}>
          {visibleTabs.map((t) => (
            <Tab key={t.label} label={t.label} />
          ))}
        </StyledTabs>
      </HeaderWrapper>

      <ContentWrapper>
        {visibleTabs[safeTab]?.content}
      </ContentWrapper>
    </>
  );
};

export default HubPage;

