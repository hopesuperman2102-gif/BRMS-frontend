// RightPanel.tsx
import React from 'react';
import { Box, Typography, CircularProgress, styled } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { VerticalRightPanelProps } from '../types/verticalTypes';

const RightPanelContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: 'auto',
  background: brmsTheme.colors.bgRight,
  padding: '48px',
  '@media (max-width: 600px)': {
    padding: '48px 24px',
  },
});

const HeaderSection = styled(Box)({
  marginBottom: '32px',
  flexShrink: 0,
});

const AccentBar = styled(Box)({
  width: '32px',
  height: '2px',
  borderRadius: '1px',
  background: brmsTheme.colors.panelIndigo,
  marginBottom: '24px',
  opacity: 0.9,
});

const HeaderTitle = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 800,
  color: brmsTheme.colors.lightTextHigh,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  marginBottom: '8px',
  fontFamily: brmsTheme.fonts.sans,
});

const HeaderSubtitle = styled(Typography)({
  fontSize: '0.8125rem',
  color: brmsTheme.colors.lightTextMid,
  fontWeight: 400,
  lineHeight: 1.65,
  fontFamily: brmsTheme.fonts.sans,
});

const LoadingContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const EmptyContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const EmptyText = styled(Typography)({
  fontSize: '0.875rem',
  color: brmsTheme.colors.lightTextLow,
  fontFamily: brmsTheme.fonts.mono,
});

const VerticalList = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const VerticalCard = styled(Box)<{ isHovered: boolean }>(({ isHovered }) => ({
  borderRadius: '10px',
  border: `1px solid ${isHovered ? brmsTheme.colors.panelIndigo : brmsTheme.colors.lightBorder}`,
  padding: '16px 20px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transform: isHovered ? 'translateY(-1px)' : 'none',
  boxShadow: isHovered ? `0 4px 16px ${brmsTheme.colors.panelIndigoGlow}` : '0 1px 3px rgba(0,0,0,0.04)',
}));

const VerticalInfo = styled(Box)({});

const VerticalName = styled(Typography)<{ isHovered: boolean }>(({ isHovered }) => ({
  fontWeight: 700,
  fontSize: '0.9375rem',
  letterSpacing: '-0.01em',
  fontFamily: brmsTheme.fonts.sans,
  transition: 'color 0.15s',
  marginBottom: '2px',
}));

const VerticalKey = styled(Typography)({
  fontSize: '0.6875rem',
  color: brmsTheme.colors.lightTextLow,
  fontFamily: brmsTheme.fonts.mono,
  letterSpacing: '0.04em',
});

const ArrowContainer = styled(Box)<{ isHovered: boolean }>(({ isHovered }) => ({
  width: 28,
  height: 28,
  borderRadius: '6px',
  background: isHovered ? brmsTheme.colors.panelIndigo : brmsTheme.colors.lightSurfaceHover,
  border: `1px solid ${isHovered ? brmsTheme.colors.panelIndigo : brmsTheme.colors.lightBorder}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease',
  flexShrink: 0,
}));

export default function VerticalRightPanel({
  verticals,
  loading,
  hoveredKey,
  onCardHover,
  onCardClick
}: VerticalRightPanelProps) {
  return (
    <RightPanelContainer>
      {/* Accent bar + heading */}
      <HeaderSection>
        <AccentBar />
        <HeaderTitle>Determine your Realm</HeaderTitle>
        <HeaderSubtitle>Choose the business domain you want to work in.</HeaderSubtitle>
      </HeaderSection>

      {/* Content */}
      {loading ? (
        <LoadingContainer>
          <CircularProgress size={24} sx={{ color: brmsTheme.colors.panelIndigo }} />
        </LoadingContainer>
      ) : verticals.length === 0 ? (
        <EmptyContainer>
          <EmptyText>No verticals found.</EmptyText>
        </EmptyContainer>
      ) : (
        <VerticalList>
          {verticals.map((item) => {
            const isHovered = hoveredKey === item.vertical_key;
            return (
              <VerticalCard
                key={item.id}
                isHovered={isHovered}
                onClick={() => onCardClick(item)}
                onMouseEnter={() => onCardHover(item.vertical_key)}
                onMouseLeave={() => onCardHover(null)}
              >
                <VerticalInfo>
                  <VerticalName isHovered={isHovered}>
                    {item.vertical_name}
                  </VerticalName>
                  <VerticalKey>{item.vertical_key}</VerticalKey>
                </VerticalInfo>

                <ArrowContainer isHovered={isHovered}>
                  <ArrowForwardIcon 
                    sx={{ 
                      fontSize: 14, 
                      color: isHovered ? '#ffffff' : brmsTheme.colors.lightTextLow, 
                      transition: 'color 0.15s' 
                    }} 
                  />
                </ArrowContainer>
              </VerticalCard>
            );
          })}
        </VerticalList>
      )}
    </RightPanelContainer>
  );
}
