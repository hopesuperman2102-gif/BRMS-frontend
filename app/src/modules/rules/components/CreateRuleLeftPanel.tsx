'use client';

import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { CreateRuleLeftPanelProps } from '../types/rulesTypes';

const { colors, fonts } = brmsTheme;

/* ─── Styled Components ───────────────────────────────────── */
const PanelRoot = styled(Box)({
  display: 'none',
  '@media (min-width: 1200px)': { display: 'flex' },
  flexDirection: 'column',
  width: '42%',
  flexShrink: 0,
  height: '100vh',
  position: 'relative',
  overflow: 'hidden',
  background: colors.panelBg,
  borderRight: `1px solid ${colors.panelBorder}`,
});

const GlowOrb = styled(Box)({
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

const PanelInner = styled(Box)({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '40px 48px',
});

const BackButtonWrapper = styled(Box)({
  flexShrink: 0,
  marginBottom: 'auto',
});

const BackButton = styled(Button)({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.75rem',
  color: colors.panelTextMid,
  paddingLeft: 0,
  paddingRight: 0,
  minWidth: 0,
  background: 'none',
  letterSpacing: '0.02em',
  '&:hover': {
    color: colors.textOnPrimary,
    background: 'none',
  },
  transition: 'color 0.15s',
});

const HeroSection = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const BadgeRow = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '24px',
});

const BadgeDot = styled(Box)({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: colors.panelIndigo,
  boxShadow: `0 0 8px ${colors.panelIndigoGlow}`,
});

const BadgeLabel = styled(Typography)({
  fontSize: '0.625rem',
  fontWeight: 700,
  color: colors.panelTextLow,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontFamily: fonts.mono,
});

const HeroHeading = styled(Typography)({
  fontSize: 'clamp(2rem, 2.6vw, 2.75rem)',
  fontWeight: 800,
  color: colors.textOnPrimary,
  lineHeight: 1.05,
  letterSpacing: '-0.04em',
  marginBottom: '20px',
  whiteSpace: 'pre-line',
});

const HeroSubtitle = styled(Typography)({
  fontSize: '0.8125rem',
  color: colors.panelTextMid,
  lineHeight: 1.8,
  marginBottom: '40px',
  maxWidth: '300px',
  fontWeight: 400,
});

const FeatureList = styled(Box)({});

const FeatureRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'last',
})<{ last?: boolean }>(({ last }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  paddingTop: '12px',
  paddingBottom: '12px',
  borderBottom: last ? 'none' : `1px solid ${colors.panelBorder}`,
}));

const FeatureDot = styled(Box)({
  width: '4px',
  height: '4px',
  borderRadius: '50%',
  backgroundColor: colors.panelIndigo,
  flexShrink: 0,
});

const FeatureText = styled(Typography)({
  fontSize: '0.8rem',
  color: colors.panelTextMid,
  fontWeight: 400,
  lineHeight: 1,
  letterSpacing: '0.01em',
});

/* ─── Feature item ────────────────────────────────────────── */
const Feature = ({ children, last }: { children: string; last?: boolean }) => (
  <FeatureRow last={last}>
    <FeatureDot />
    <FeatureText>{children}</FeatureText>
  </FeatureRow>
);

/* ─── Component ───────────────────────────────────────────── */
export default function CreateRuleLeftPanel({ isEditMode, onBack }: CreateRuleLeftPanelProps) {
  return (
    <PanelRoot>
      <GlowOrb />
      <DotGrid />

      <PanelInner>
        {/* Back */}
        <BackButtonWrapper>
          <BackButton
            startIcon={<ArrowBackIcon sx={{ fontSize: '12px !important' }} />}
            onClick={onBack}
            disableRipple
          >
            Rules
          </BackButton>
        </BackButtonWrapper>

        {/* Hero copy */}
        <HeroSection>
          <BadgeRow>
            <BadgeDot />
            <BadgeLabel>
              {isEditMode ? 'Editing · Rule' : 'New · Rule'}
            </BadgeLabel>
          </BadgeRow>

          <HeroHeading>
            {isEditMode ? 'Refine your\nrule.' : 'Define your\nlogic.'}
          </HeroHeading>

          <HeroSubtitle>
            {isEditMode
              ? 'Update your rule details to keep your decision logic accurate and your team aligned.'
              : 'Rules are the building blocks of your decision engine. Name it, describe it, and place it.'}
          </HeroSubtitle>

          <FeatureList>
            {['Folder-based rule organisation', 'Full path tracking & versioning', 'Plugs into your JDM decision graph'].map((label, i) => (
              <Feature key={label} last={i === 2}>{label}</Feature>
            ))}
          </FeatureList>
        </HeroSection>
      </PanelInner>
    </PanelRoot>
  );
}