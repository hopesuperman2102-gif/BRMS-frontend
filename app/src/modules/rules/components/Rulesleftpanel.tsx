'use client';

import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import AccountTree from '@mui/icons-material/AccountTree';
import { FolderNode, FileNode } from '../types/Explorertypes';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';


const { colors, fonts } = brmsTheme;

const STATUS_DOT: Record<string, string> = {
  using:      colors.statusUsingDot,
  active:     colors.statusUsingDot,
  draft:      colors.statusDraftDot,
  inactive:   colors.statusInactiveDot,
  deprecated: colors.statusDeprecatedDot,
};

interface RulesLeftPanelProps {
  projectName: string;
  verticalName: string;
  folders: FolderNode[];
  files: FileNode[];
  currentPath: string;
  hoveredRule: FileNode | null;
}

/* ─── Styled Components ─────────────────────────────────── */

const PanelRoot = styled('div')(({ theme }) => ({
  display: 'none',
  flexDirection: 'column',
  width: '38%',
  flexShrink: 0,
  background: colors.panelBg,
  borderRight: `1px solid ${colors.panelBorder}`,
  position: 'relative',
  overflow: 'hidden',
  padding: '32px 36px',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const GlowOrb = styled('div')({
  position: 'absolute',
  bottom: -80,
  left: -80,
  width: 360,
  height: 360,
  borderRadius: '50%',
  background: `radial-gradient(circle, ${colors.panelIndigoGlow} 0%, transparent 60%)`,
  pointerEvents: 'none',
});

const DotGrid = styled('div')({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  opacity: 0.08,
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
  backgroundSize: '28px 28px',
});

const PanelInner = styled('div')({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

const TitleRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '8px',
});

const IconBox = styled('div')({
  width: 36,
  height: 36,
  borderRadius: '8px',
  background: colors.panelIndigoTint15,
  border: `1px solid ${colors.panelIndigoTint25}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const AccountTreeIcon = styled(AccountTree)({
  fontSize: 18,
  color: colors.indigoLight,
});

const PanelTitle = styled(Typography)({
  fontSize: '1rem',
  fontWeight: 800,
  color: colors.white,
  letterSpacing: '-0.025em',
  lineHeight: 1,
});

const PanelSubtitle = styled(Typography)({
  fontSize: '0.8125rem',
  color: colors.panelTextMid,
  lineHeight: 1.75,
  marginBottom: '24px',
  fontWeight: 400,
});

const CountCardsRow = styled('div')({
  display: 'flex',
  gap: '12px',
  marginBottom: '28px',
});

const CountCard = styled('div')({
  flex: 1,
  borderRadius: '8px',
  border: `1px solid ${colors.panelBorder}`,
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.03)',
});

const CountValue = styled(Typography)({
  fontSize: '1.375rem',
  fontWeight: 800,
  color: colors.white,
  fontFamily: fonts.mono,
  lineHeight: 1,
  marginBottom: '4px',
});

const CountLabel = styled(Typography)({
  fontSize: '0.625rem',
  color: colors.panelTextMid,
  fontFamily: fonts.mono,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
});

const SectionLabel = styled(Typography)({
  fontSize: '0.625rem',
  fontWeight: 700,
  color: colors.panelTextLow,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  fontFamily: fonts.mono,
  marginBottom: '12px',
});

const StatusSection = styled('div')({
  marginBottom: '28px',
});

const StatusList = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

const StatusRow = styled('div')<{ hasborder: string }>(({ hasborder }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: hasborder === 'true' ? `1px solid ${colors.panelBorder}` : 'none',
}));

const StatusLeft = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const StatusDot = styled('div')<{ dotcolor: string }>(({ dotcolor }) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: dotcolor,
  flexShrink: 0,
}));

const StatusName = styled(Typography)({
  fontSize: '0.8125rem',
  color: colors.panelTextMid,
  textTransform: 'capitalize' as const,
  fontFamily: fonts.mono,
  letterSpacing: '0.02em',
});

const StatusCount = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 700,
  color: colors.white,
  fontFamily: fonts.mono,
});

const PreviewSection = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

const PreviewEmpty = styled('div')({
  opacity: 0.3,
});

const HoveredName = styled(Typography)({
  fontSize: '1.05rem',
  fontWeight: 800,
  color: colors.white,
  letterSpacing: '-0.025em',
  lineHeight: 1.15,
  marginBottom: '12px',
});

const IndigoDivider = styled('div')({
  width: 24,
  height: 2,
  borderRadius: 1,
  background: colors.panelIndigo,
  marginBottom: 12,
  opacity: 0.7,
});

const HoveredDesc = styled(Typography)({
  fontSize: '0.8125rem',
  color: colors.panelTextMid,
  lineHeight: 1.75,
  fontWeight: 400,
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  overflow: 'hidden',
});

const PreviewText = styled(Typography)({
  fontSize: '0.8125rem',
  color: colors.panelTextMid,
  lineHeight: 1.75,
});

/* ─── Component ─────────────────────────────────────────── */

export function RulesLeftPanel({ folders, files, hoveredRule }: RulesLeftPanelProps) {
  const totalRules   = files.length;
  const totalFolders = folders.filter((f) => !f.isTemp).length;

  const statusCounts = files.reduce<Record<string, number>>((acc, f) => {
    const s = (f.status ?? 'draft').toLowerCase();
    if (s === 'deleted') return acc;
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <PanelRoot>
      <GlowOrb />
      <DotGrid />

      <PanelInner>
        {/* Icon + Title */}
        <TitleRow>
          <IconBox>
            <AccountTreeIcon />
          </IconBox>
          <div>
            <PanelTitle>Rules</PanelTitle>
          </div>
        </TitleRow>

        <PanelSubtitle>
          Manage your decision rules, folders, and versions for this project.
        </PanelSubtitle>

        {/* Count Cards */}
        <CountCardsRow>
          {([['Rules', String(totalRules)], ['Folders', String(totalFolders)]] as [string, string][]).map(([label, val]) => (
            <CountCard key={label}>
              <CountValue>{val}</CountValue>
              <CountLabel>{label}</CountLabel>
            </CountCard>
          ))}
        </CountCardsRow>

        {/* By Status */}
        {Object.keys(statusCounts).length > 0 && (
          <StatusSection>
            <SectionLabel>By Status</SectionLabel>
            <StatusList>
              {Object.entries(statusCounts).map(([status, count], i, arr) => (
                <StatusRow key={status} hasborder={String(i < arr.length - 1)}>
                  <StatusLeft>
                    <StatusDot dotcolor={STATUS_DOT[status] ?? colors.lightTextLow} />
                    <StatusName>{status}</StatusName>
                  </StatusLeft>
                  <StatusCount>{count}</StatusCount>
                </StatusRow>
              ))}
            </StatusList>
          </StatusSection>
        )}

        {/* Hover Preview */}
        <PreviewSection>
          {hoveredRule ? (
            <div>
              <SectionLabel>Selected</SectionLabel>
              <HoveredName>{hoveredRule.name}</HoveredName>
              <IndigoDivider />
              <HoveredDesc>
                {hoveredRule.description || 'No description provided for this rule.'}
              </HoveredDesc>
            </div>
          ) : (
            <PreviewEmpty>
              <SectionLabel>Preview</SectionLabel>
              <PreviewText>Hover a rule to see its details here.</PreviewText>
            </PreviewEmpty>
          )}
        </PreviewSection>
      </PanelInner>
    </PanelRoot>
  );
}