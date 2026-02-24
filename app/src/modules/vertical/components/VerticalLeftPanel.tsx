// LeftPanel-with-animation.tsx
import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';

const LeftPanelContainer = styled(Box)({
  display: 'none',
  flexDirection: 'column',
  width: '42%',
  flexShrink: 0,
  height: '100vh',
  position: 'relative',
  overflow: 'hidden',
  background: brmsTheme.colors.bgLeft,
  borderRight: `1px solid ${brmsTheme.colors.panelBorder}`,
  '@media (min-width: 1200px)': {
    display: 'flex',
  },
});

const GlowEffect = styled(Box)({
  position: 'absolute',
  bottom: -80,
  left: -80,
  width: 400,
  height: 400,
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(79,70,229,0.14) 0%, transparent 60%)',
  pointerEvents: 'none',
});

const DotGrid = styled(Box)({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  opacity: 0.09,
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
  backgroundSize: '28px 28px',
});

const ContentContainer = styled(Box)({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '40px 48px',
});

const LogoContainer = styled(Box)({
  flexShrink: 0,
  marginBottom: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
});

const LogoIcon = styled(Box)({
  width: 32,
  height: 32,
  borderRadius: '8px',
  background: brmsTheme.colors.panelIndigoTint15,
  border: `1px solid ${brmsTheme.colors.panelIndigoTint25}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const LogoText = styled(Typography)({
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: brmsTheme.colors.panelTextMid,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  fontFamily: brmsTheme.fonts.mono,
});

const HeroSection = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const Badge = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '24px',
});

const BadgeDot = styled(Box)({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: brmsTheme.colors.panelIndigo,
  boxShadow: `0 0 8px ${brmsTheme.colors.panelIndigoGlow}`,
});

const BadgeText = styled(Typography)({
  fontSize: '0.625rem',
  fontWeight: 700,
  color: brmsTheme.colors.panelTextLow,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontFamily: brmsTheme.fonts.mono,
});

// 🎨 NEW: Animated SubText with smooth transition
const SubText = styled(Typography)({
  fontSize: '0.8125rem',
  color: brmsTheme.colors.panelTextMid,
  lineHeight: 1.8,
  marginBottom: '40px',
  maxWidth: '300px',
  fontWeight: 400,
  fontFamily: brmsTheme.fonts.sans,
  // Smooth fade transition
  transition: 'opacity 0.3s ease-in-out, color 0.3s ease-in-out',
  opacity: 1,
  '&.transitioning': {
    opacity: 0.6,
  },
});

const FeatureContainer = styled(Box)({});

const FeatureItem = styled(Box)<{ last?: boolean }>(({ last }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 0',
  borderBottom: last ? 'none' : `1px solid ${brmsTheme.colors.panelBorder}`,
}));

const FeatureDot = styled(Box)({
  width: '4px',
  height: '4px',
  borderRadius: '50%',
  backgroundColor: brmsTheme.colors.panelIndigo,
  flexShrink: 0,
});

const FeatureText = styled(Typography)({
  fontSize: '0.8rem',
  color: brmsTheme.colors.panelTextMid,
  fontWeight: 400,
  lineHeight: 1,
  letterSpacing: '0.01em',
  fontFamily: brmsTheme.fonts.sans,
});

const CountContainer = styled(Box)({
  marginTop: '40px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
});

const CountLine = styled(Box)({
  height: '1px',
  width: '24px',
  backgroundColor: brmsTheme.colors.panelBorder,
});

const CountText = styled(Typography)({
  fontSize: '0.6875rem',
  color: brmsTheme.colors.panelTextLow,
  fontFamily: brmsTheme.fonts.mono,
  letterSpacing: '0.08em',
});

const Feature = ({ children, last }: { children: string; last?: boolean }) => (
  <FeatureItem last={last}>
    <FeatureDot />
    <FeatureText>{children}</FeatureText>
  </FeatureItem>
);

interface VerticalLeftPanelProps {
  verticalCount: number;
  loading: boolean;
  selectedVerticalDescription?: string;
}

export default function VerticalLeftPanel({ 
  verticalCount, 
  loading,
  selectedVerticalDescription 
}: VerticalLeftPanelProps) {
  const DEFAULT_DESCRIPTION = 'Each vertical is an isolated decision domain. Select one to manage its projects, rules, and deployment pipelines.';
  const displayDescription = selectedVerticalDescription || DEFAULT_DESCRIPTION;
  
  // Track if we're in a transition state for animation
  const isCustomDescription = !!selectedVerticalDescription;

  return (
    <LeftPanelContainer>
      <GlowEffect />
      <DotGrid />

      <ContentContainer>
        {/* Logo / wordmark */}
        <LogoContainer>
          <LogoIcon>
            <LayersIcon sx={{ fontSize: 16, color: brmsTheme.colors.indigoLight }} />
          </LogoIcon>
          <LogoText>BRMS Platform</LogoText>
        </LogoContainer>

        {/* Hero copy */}
        <HeroSection>
          {/* Badge */}
          <Badge>
            <BadgeDot />
            <BadgeText>Select · Vertical</BadgeText>
          </Badge>

          {/* Sub-copy - WITH ANIMATION */}
          <SubText 
            className={isCustomDescription ? 'transitioning' : ''}
            sx={{
              opacity: isCustomDescription ? 0.8 : 1,
              transition: 'opacity 0.4s ease-in-out, color 0.4s ease-in-out',
            }}
          >
            {displayDescription}
          </SubText>

          {/* Feature list */}
          <FeatureContainer>
            {[
              'Isolated rule sets per business domain',
              'Independent versioning & deployment',
              'Role-based access per vertical',
            ].map((label, i) => (
              <Feature key={label} last={i === 2}>{label}</Feature>
            ))}
          </FeatureContainer>

          {/* Live count */}
          {!loading && verticalCount > 0 && (
            <CountContainer>
              <CountLine />
              <CountText>
                {verticalCount} {verticalCount === 1 ? 'vertical' : 'verticals'} available
              </CountText>
            </CountContainer>
          )}
        </HeroSection>

      </ContentContainer>
    </LeftPanelContainer>
  );
}