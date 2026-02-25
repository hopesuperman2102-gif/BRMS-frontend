'use client';

import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import AccountTree from '@mui/icons-material/AccountTree';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { RulesLeftPanelProps } from '../types/Explorertypes';

const { colors, fonts } = brmsTheme;

/* ─── Styled Components ───────────────────────────────────── */
const LeftPanel = styled(Box)({
  display: 'none',
  '@media (min-width: 900px)': { display: 'flex' },
  flexDirection: 'column',
  width: '38%',
  flexShrink: 0,
  background: colors.panelBg,
  borderRight: `1px solid ${colors.panelBorder}`,
  position: 'relative',
  overflow: 'hidden',
  padding: '32px 36px',
});

const LeftVignette = styled(Box)({
  position: 'absolute',
  bottom: -80,
  left: -80,
  width: 360,
  height: 360,
  borderRadius: '50%',
  pointerEvents: 'none',
  background: 'radial-gradient(circle, rgba(79,70,229,0.16) 0%, transparent 60%)',
});

const LeftDotGrid = styled(Box)({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  opacity: 0.08,
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
  backgroundSize: '28px 28px',
});

const LeftContent = styled(Box)({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

const LeftTitleRow = styled(Box)({
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

const LeftTitleText = styled(Typography)({
  fontSize: '1.125rem',
  fontWeight: 800,
  color: colors.textOnPrimary,
  letterSpacing: '-0.025em',
  lineHeight: 1,
});

const LeftSubtitle = styled(Typography)({
  fontSize: '0.8125rem',
  color: colors.panelTextMid,
  lineHeight: 1.75,
  marginBottom: 24,
});

/* ── Stat Cards row ── */
const StatsCardsRow = styled(Box)({
  display: 'flex',
  gap: '12px',
  marginBottom: '28px',
});

const StatCard = styled(Box)({
  flex: 1,
  borderRadius: '8px',
  border: `1px solid ${colors.panelBorder}`,
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.03)',
});

const StatValue = styled(Typography)({
  fontSize: '1.375rem',
  fontWeight: 800,
  color: colors.textOnPrimary,
  fontFamily: fonts.mono,
  lineHeight: 1,
  marginBottom: '4px',
});

const StatLabel = styled(Typography)({
  fontSize: '0.625rem',
  color: colors.panelTextMid,
  fontFamily: fonts.mono,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
});

const PreviewArea = styled(Box)({
  flex: 1,
});

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

const PlaceholderBox = styled(Box)({
  opacity: 0.3,
});

/* ─── Component ───────────────────────────────────────────── */
export default function RulesLeftPanel({ projectName, files, folders, hoveredRule }: RulesLeftPanelProps) {
  const totalRules   = files.length;
  const totalFolders = folders.filter((f) => !f.isTemp).length;

  return (
    <LeftPanel>
      <LeftVignette />
      <LeftDotGrid />
      <LeftContent>
        {/* Title */}
        <LeftTitleRow>
          <IconBox>
            <AccountTree sx={{ fontSize: 18, color: colors.textOnPrimary, opacity: 0.85 }} />
          </IconBox>
          <LeftTitleText>{projectName || 'Rules'}</LeftTitleText>
        </LeftTitleRow>

        <LeftSubtitle>
          Manage your decision rules, folders, and versions for this project.
        </LeftSubtitle>

        {/* Stat Cards */}
        <StatsCardsRow>
          <StatCard>
            <StatValue>{totalRules}</StatValue>
            <StatLabel>Rules</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{totalFolders}</StatValue>
            <StatLabel>Folders</StatLabel>
          </StatCard>
        </StatsCardsRow>

        {/* Hover Preview */}
        <PreviewArea>
          {hoveredRule ? (
            <>
              <PreviewDimLabel>Selected</PreviewDimLabel>
              <PreviewName>{hoveredRule.name}</PreviewName>
              <PreviewAccentLine />
              <PreviewBody>
                {hoveredRule.description || 'No description provided for this rule.'}
              </PreviewBody>
            </>
          ) : (
            <PlaceholderBox>
              <PreviewDimLabel>Preview</PreviewDimLabel>
              <PreviewBody>Hover a rule to see its details here.</PreviewBody>
            </PlaceholderBox>
          )}
        </PreviewArea>
      </LeftContent>
    </LeftPanel>
  );
}