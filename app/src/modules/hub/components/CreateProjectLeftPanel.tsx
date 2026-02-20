'use client';

import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CreateProjectLeftPanelProps } from '../types/createPageTypes';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';

const { colors, fonts } = brmsTheme;

/* ─── Styled Components ───────────────────────────────────── */

const LeftPanelRoot = styled(Box)({
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

const IndigoVignette = styled(Box)({
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

const ContentWrapper = styled(Box)({
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
  gap: '4px',
  '&:hover': {
    color: colors.textOnPrimary,
    background: 'none',
  },
  transition: 'color 0.15s',
});

const HeroCopy = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const ModeBadgeWrapper = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '24px',
});

const ModeBadgeDot = styled(Box)({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: colors.panelIndigo,
  boxShadow: `0 0 8px ${colors.panelIndigoGlow}`,
});

const ModeBadgeText = styled(Typography)({
  fontSize: '0.625rem',
  fontWeight: 700,
  color: colors.panelTextLow,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontFamily: fonts.mono,
});

const Headline = styled(Typography)({
  fontSize: 'clamp(2rem, 2.6vw, 2.75rem)',
  fontWeight: 800,
  color: colors.textOnPrimary,
  lineHeight: 1.05,
  letterSpacing: '-0.04em',
  marginBottom: '20px',
  whiteSpace: 'pre-line',
});

const SubCopy = styled(Typography)({
  fontSize: '0.8125rem',
  color: colors.panelTextMid,
  lineHeight: 1.8,
  marginBottom: '40px',
  maxWidth: '300px',
  fontWeight: 400,
});

const FeatureRow = styled(Box)<{ last?: boolean }>(({ last }) => ({
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

/* ─── Feature Item ────────────────────────────────────────── */

const Feature = ({ children, last }: { children: string; last?: boolean }) => (
  <FeatureRow last={last}>
    <FeatureDot />
    <FeatureText>{children}</FeatureText>
  </FeatureRow>
);

/* ─── Component ───────────────────────────────────────────── */

export default function CreateProjectLeftPanel({
  isEditMode,
  onBack,
}: CreateProjectLeftPanelProps) {
  return (
    <LeftPanelRoot>
      <IndigoVignette />
      <DotGrid />

      <ContentWrapper>
        <BackButtonWrapper>
          <BackButton
            startIcon={<ArrowBackIcon sx={{ fontSize: '12px !important' }} />}
            onClick={onBack}
            disableRipple
          >
            Hub
          </BackButton>
        </BackButtonWrapper>

        <HeroCopy>
          <ModeBadgeWrapper>
            <ModeBadgeDot />
            <ModeBadgeText>
              {isEditMode ? 'Editing · Project' : 'New · Project'}
            </ModeBadgeText>
          </ModeBadgeWrapper>

          <Headline>
            {isEditMode ? 'Refine your\nproject.' : 'Build something\nremarkable.'}
          </Headline>

          <SubCopy>
            {isEditMode
              ? 'Update your project details to keep your team aligned and rules organized.'
              : 'Projects are the foundation of rule management. Define scope, structure your team, and ship.'}
          </SubCopy>

          <Box>
            {[
              'Organize rules into structured folders',
              'Version control & deployment tracking',
              'Cross-team collaboration & access control',
            ].map((label, i) => (
              <Feature key={label} last={i === 2}>
                {label}
              </Feature>
            ))}
          </Box>
        </HeroCopy>
      </ContentWrapper>
    </LeftPanelRoot>
  );
}