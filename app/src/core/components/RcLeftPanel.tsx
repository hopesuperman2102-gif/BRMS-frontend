'use client';

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { brmsTheme } from '@/core/theme/brmsTheme';

const { colors, fonts } = brmsTheme;

export type LeftPanelStat = {
  label: string;
  value: string | number;
};

export type LeftPanelPreview = {

  dimLabel?: string;
  name: string;
  description?: string;
  tag?: string;
};

export type LeftPanelLogo = {

  icon: React.ReactNode;
  text: string;
};

export type LeftPanelCount = {
  value: number;
  label: string;
};

export type LeftPanelFeature = string;

export interface LeftPanelProps {

  variant?: 'list' | 'create';
  breakpoint?: number;         //Hide panel below this breakpoint (default 900px for list, 1200px for create) 
  width?: string;             // Panel width (default "38%" for list, "42%" for create)
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  stats?: LeftPanelStat[];
  statCards?: LeftPanelStat[];
  preview?: LeftPanelPreview | null;
  placeholderText?: string;
  footer?: string;

  /* ── Create variant ────────────────────────────────── */

  logo?: LeftPanelLogo;
  backLabel?: string;
  onBack?: () => void;
  badge?: string;
  headline?: string;
  heroCopy?: string;
  features?: LeftPanelFeature[];
  count?: LeftPanelCount;
  children?: React.ReactNode;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const PanelRoot = styled(Box, {
  shouldForwardProp: (p) => p !== 'bp' && p !== 'panelWidth',
})<{ bp: number; panelWidth: string }>(({ bp, panelWidth }) => ({
  display: 'none',
  [`@media (min-width: ${bp}px)`]: { display: 'flex' },
  flexDirection: 'column',
  width: panelWidth,
  flexShrink: 0,
  height: '100%',
  background: colors.panelBg,
  borderRight: `1px solid ${colors.panelBorder}`,
  position: 'relative',
  overflow: 'hidden',
}));

const GlowOrb = styled(Box)({
  position: 'absolute',
  bottom: -80,
  left: -80,
  width: 400,
  height: 400,
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 60%)',
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

const ContentWrapper = styled(Box, {
  shouldForwardProp: (p) => p !== 'isCreate',
})<{ isCreate?: boolean }>(({ isCreate }) => ({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: isCreate ? '40px 48px' : '32px 36px',
}));

const TitleRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 16,
});

const IconBox = styled(Box)({
  width: 36,
  height: 36,
  borderRadius: '8px',
  flexShrink: 0,
  background: colors.panelIndigoTint15,
  border: `1px solid ${colors.panelIndigoTint25}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const TitleText = styled(Typography)({
  fontSize: '1.125rem',
  fontWeight: 800,
  color: colors.textOnPrimary,
  letterSpacing: '-0.025em',
  lineHeight: 1,
});

const Subtitle = styled(Typography)({
  fontSize: '0.8125rem',
  color: colors.panelTextMid,
  lineHeight: 1.75,
  marginBottom: 24,
});

const StatRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: `1px solid ${colors.panelBorder}`,
  marginBottom: 24,
});

const StatRowLabel = styled(Typography)({
  fontSize: '0.75rem',
  color: colors.panelTextMid,
  fontFamily: fonts.mono,
  letterSpacing: '0.04em',
});

const StatRowValue = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 700,
  color: colors.textOnPrimary,
  fontFamily: fonts.mono,
});

const StatCardsRow = styled(Box)({
  display: 'flex',
  gap: '12px',
  marginBottom: '28px',
});

const StatCardBox = styled(Box)({
  flex: 1,
  borderRadius: '8px',
  border: `1px solid ${colors.panelBorder}`,
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.03)',
});

const StatCardValue = styled(Typography)({
  fontSize: '1.375rem',
  fontWeight: 800,
  color: colors.textOnPrimary,
  fontFamily: fonts.mono,
  lineHeight: 1,
  marginBottom: '4px',
});

const StatCardLabel = styled(Typography)({
  fontSize: '0.625rem',
  color: colors.panelTextMid,
  fontFamily: fonts.mono,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
});

const PreviewArea = styled(Box)({ flex: 1 });

const PreviewDimLabel = styled(Typography)({
  fontSize: '0.625rem',
  fontWeight: 700,
  color: colors.panelTextLow,
  fontFamily: fonts.mono,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  marginBottom: 10,
});

const PreviewName = styled(Typography)({
  fontSize: '1.05rem',
  fontWeight: 800,
  color: colors.textOnPrimary,
  letterSpacing: '-0.025em',
  lineHeight: 1.15,
  marginBottom: 12,
});

const PreviewAccentLine = styled(Box)({
  width: 24,
  height: 2,
  borderRadius: 1,
  background: colors.panelIndigo,
  marginBottom: 12,
  opacity: 0.7,
});

const PreviewBody = styled(Typography)({
  fontSize: '0.8125rem',
  color: colors.panelTextMid,
  lineHeight: 1.75,
});

const PreviewTagRow = styled(Box)({
  marginTop: 16,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
});

const PreviewTagDot = styled(Box)({
  width: 4,
  height: 4,
  borderRadius: '50%',
  backgroundColor: colors.panelIndigo,
  opacity: 0.6,
});

const PreviewTagText = styled(Typography)({
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: colors.indigoLightMuted,
  fontFamily: fonts.mono,
  letterSpacing: '0.07em',
  textTransform: 'uppercase' as const,
});

const Placeholder = styled(Box)({ opacity: 0.3 });

const Footer = styled(Typography)({
  fontSize: '0.625rem',
  color: colors.panelTextLow,
  fontWeight: 500,
  fontFamily: fonts.mono,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  marginTop: 32,
});

const LogoRow = styled(Box)({
  flexShrink: 0,
  marginBottom: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
});

const LogoIconBox = styled(Box)({
  width: 32,
  height: 32,
  borderRadius: '8px',
  background: colors.panelIndigoTint15,
  border: `1px solid ${colors.panelIndigoTint25}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const LogoLabel = styled(Typography)({
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: colors.panelTextMid,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  fontFamily: fonts.mono,
});

const BackButtonWrapper = styled(Box)({
  flexShrink: 0,
  marginBottom: 'auto',
});

const BackBtn = styled(Button)({
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
  '&:hover': { color: colors.textOnPrimary, background: 'none' },
  transition: 'color 0.15s',
});

/* Hero section */
const HeroCopy = styled(Box)({
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

const BadgeText = styled(Typography)({
  fontSize: '0.625rem',
  fontWeight: 700,
  color: colors.panelTextLow,
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
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

const HeroSubtitle = styled(Typography, {
  shouldForwardProp: (p) => p !== 'animated',
})<{ animated?: boolean }>(({ animated }) => ({
  fontSize: '0.8125rem',
  color: colors.panelTextMid,
  lineHeight: 1.8,
  marginBottom: '40px',
  maxWidth: '300px',
  fontWeight: 400,
  ...(animated && {
    animation: `${fadeIn} 0.35s ease-in-out`,
  }),
}));

const FeatureRow = styled(Box, {
  shouldForwardProp: (p) => p !== 'last',
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

const CountRow = styled(Box)({
  marginTop: '40px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
});

const CountLine = styled(Box)({
  height: '1px',
  width: '24px',
  backgroundColor: colors.panelBorder,
});

const CountText = styled(Typography)({
  fontSize: '0.6875rem',
  color: colors.panelTextLow,
  fontFamily: fonts.mono,
  letterSpacing: '0.08em',
});

export default function RcLeftPanel({
  variant = 'list',
  breakpoint,
  width,

  // List
  icon,
  title,
  subtitle,
  stats,
  statCards,
  preview,
  placeholderText = 'Hover an item to see its details here.',
  footer = 'BRMS Platform · 2025',

  // Create
  logo,
  backLabel = 'Back',
  onBack,
  badge,
  headline,
  heroCopy,
  features,
  count,

  // Slot
  children,
}: LeftPanelProps) {
  const isCreate = variant === 'create';
  const bp = breakpoint ?? (isCreate ? 1200 : 900);
  const panelWidth = width ?? (isCreate ? '42%' : '38%');

  return (
    <PanelRoot bp={bp} panelWidth={panelWidth}>
      <GlowOrb />
      <DotGrid />

      <ContentWrapper isCreate={isCreate}>

        {/* ─── CREATE VARIANT ───────────────────────────── */}
        {isCreate && (
          <>
            {/* Logo OR back button at the top */}
            {logo ? (
              <LogoRow>
                <LogoIconBox>{logo.icon}</LogoIconBox>
                <LogoLabel>{logo.text}</LogoLabel>
              </LogoRow>
            ) : onBack ? (
              <BackButtonWrapper>
                <BackBtn
                  startIcon={<ArrowBackIcon sx={{ fontSize: '12px !important' }} />}
                  onClick={onBack}
                  disableRipple
                >
                  {backLabel}
                </BackBtn>
              </BackButtonWrapper>
            ) : null}

            {(badge || headline || heroCopy || (features && features.length > 0) || count) && (
            <HeroCopy>
              {badge && (
                <BadgeRow>
                  <BadgeDot />
                  <BadgeText>{badge}</BadgeText>
                </BadgeRow>
              )}

              {headline && <Headline>{headline}</Headline>}

              {/* heroCopy animates whenever its value changes */}
              {heroCopy && (
                <HeroSubtitle key={heroCopy} animated>
                  {heroCopy}
                </HeroSubtitle>
              )}

              {features && features.length > 0 && (
                <Box>
                  {features.map((f, i) => (
                    <FeatureRow key={f} last={i === features.length - 1}>
                      <FeatureDot />
                      <FeatureText>{f}</FeatureText>
                    </FeatureRow>
                  ))}
                </Box>
              )}

              {/* Live count chip */}
              {count && count.value > 0 && (
                <CountRow>
                  <CountLine />
                  <CountText>
                    {count.value} {count.value === 1 ? count.label : `${count.label}s`} available
                  </CountText>
                </CountRow>
              )}
            </HeroCopy>
            )}
          </>
        )}

        {/* ─── LIST VARIANT ─────────────────────────────── */}
        {!isCreate && (
          <>
            {(icon || title) && (
              <TitleRow>
                {icon && <IconBox>{icon}</IconBox>}
                {title && <TitleText>{title}</TitleText>}
              </TitleRow>
            )}

            {subtitle && <Subtitle>{subtitle}</Subtitle>}

            {stats && stats.map((s) => (
              <StatRow key={s.label}>
                <StatRowLabel>{s.label}</StatRowLabel>
                <StatRowValue>{s.value}</StatRowValue>
              </StatRow>
            ))}

            {statCards && statCards.length > 0 && (
              <StatCardsRow>
                {statCards.map((s) => (
                  <StatCardBox key={s.label}>
                    <StatCardValue>{s.value}</StatCardValue>
                    <StatCardLabel>{s.label}</StatCardLabel>
                  </StatCardBox>
                ))}
              </StatCardsRow>
            )}

            <PreviewArea>
              {preview ? (
                <>
                  <PreviewDimLabel>{preview.dimLabel ?? 'Selected'}</PreviewDimLabel>
                  <PreviewName>{preview.name}</PreviewName>
                  <PreviewAccentLine />
                  <PreviewBody>{preview.description || 'No description provided.'}</PreviewBody>
                  {preview.tag && (
                    <PreviewTagRow>
                      <PreviewTagDot />
                      <PreviewTagText>{preview.tag}</PreviewTagText>
                    </PreviewTagRow>
                  )}
                </>
              ) : (
                <Placeholder>
                  <PreviewDimLabel>Preview</PreviewDimLabel>
                  <PreviewBody>{placeholderText}</PreviewBody>
                </Placeholder>
              )}
            </PreviewArea>

            {footer && <Footer>{footer}</Footer>}
          </>
        )}

        {/* ─── Extra children slot ──────────────────────── */}
        {children}

      </ContentWrapper>
    </PanelRoot>
  );
}
