'use client';

import { Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { FileCardProps } from '../types/Explorertypes';
import { fmtDate } from '../pages/ProjectRulePage';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';

const { colors, fonts } = brmsTheme;

const STATUS_MAP: Record<string, { bg: string; color: string; dot: string; border: string }> = {
  using:      { bg: colors.statusUsingBg,      color: colors.statusUsingText,      dot: colors.statusUsingDot,      border: colors.statusUsingBorder },
  active:     { bg: colors.statusUsingBg,      color: colors.statusUsingText,      dot: colors.statusUsingDot,      border: colors.statusUsingBorder },
  draft:      { bg: colors.statusDraftBg,      color: colors.statusDraftText,      dot: colors.statusDraftDot,      border: colors.statusDraftBorder },
  inactive:   { bg: colors.statusInactiveBg,   color: colors.statusInactiveText,   dot: colors.statusInactiveDot,   border: colors.statusInactiveBorder },
  deprecated: { bg: colors.statusDeprecatedBg, color: colors.statusDeprecatedText, dot: colors.statusDeprecatedDot, border: colors.statusDeprecatedBorder },
};

/* ── Styled: StatusPill wrapper ── */
const PillRoot = styled('div')<{ statuskey: string }>(({ statuskey }) => {
  const style = STATUS_MAP[statuskey] ?? {
    bg: colors.statusDefaultBg,
    color: colors.statusDefaultText,
    dot: colors.statusDefaultDot,
    border: colors.statusDefaultBorder,
  };
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '2px 7px',
    borderRadius: '4px',
    backgroundColor: style.bg,
    border: `1px solid ${style.border}`,
  };
});

const PillDot = styled('div')<{ statuskey: string }>(({ statuskey }) => {
  const style = STATUS_MAP[statuskey] ?? { dot: colors.statusDefaultDot };
  return {
    width: 5,
    height: 5,
    borderRadius: '50%',
    backgroundColor: style.dot,
    flexShrink: 0,
  };
});

const PillLabel = styled(Typography)<{ statuskey: string }>(({ statuskey }) => {
  const style = STATUS_MAP[statuskey] ?? { color: colors.statusDefaultText };
  return {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: style.color,
    textTransform: 'capitalize' as const,
    letterSpacing: '0.03em',
    fontFamily: fonts.mono,
  };
});

export function StatusPill({ status }: { status: string }) {
  const key = (status ?? 'draft').toLowerCase();
  return (
    <PillRoot statuskey={key}>
      <PillDot statuskey={key} />
      <PillLabel statuskey={key}>{status}</PillLabel>
    </PillRoot>
  );
}

/* ─── FileCard ─────────────────────────────────────────── */

const CardRoot = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderRadius: '8px',
  border: `1px solid ${colors.lightBorder}`,
  backgroundColor: colors.white,
  cursor: 'pointer',
  transition: 'all 0.15s',
  '&:hover': {
    borderColor: colors.panelIndigo,
    boxShadow: `0 0 0 3px ${colors.panelIndigoMuted}`,
    transform: 'translateY(-1px)',
    '& .file-action': { opacity: 1 },
  },
});

const CardInner = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1,
  minWidth: 0,
});

const IconWrap = styled('div')({
  width: 34,
  height: 34,
  borderRadius: '8px',
  flexShrink: 0,
  background: colors.surfaceBase,
  border: `1px solid ${colors.lightBorder}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const FileIcon = styled(InsertDriveFileOutlinedIcon)({
  color: colors.tabTextInactive,
  fontSize: 16,
});

const MetaWrap = styled('div')({
  minWidth: 0,
  flex: 1,
});

const FileName = styled(Typography)({
  fontWeight: 600,
  fontSize: '0.9375rem',
  color: colors.lightTextHigh,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  marginBottom: '4px',
  letterSpacing: '-0.01em',
});

const BadgeRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
});

const VersionBadge = styled('div')({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 7px',
  borderRadius: '4px',
  border: `1px solid ${colors.lightBorder}`,
  backgroundColor: colors.surfaceBase,
});

const VersionText = styled(Typography)({
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: colors.panelIndigo,
  letterSpacing: '0.03em',
  fontFamily: fonts.mono,
});

const DateText = styled(Typography)({
  fontSize: '0.6875rem',
  color: colors.lightTextLow,
  whiteSpace: 'nowrap',
  fontFamily: fonts.mono,
});

const MenuButton = styled(IconButton)({
  opacity: 0,
  marginLeft: '8px',
  width: 28,
  height: 28,
  borderRadius: '6px',
  color: colors.lightTextLow,
  flexShrink: 0,
  transition: 'all 0.15s',
  '&:hover': {
    backgroundColor: colors.lightSurfaceHover,
    color: colors.lightTextMid,
  },
});

export function FileCard({ item, onOpen, onMenuOpen, onMouseEnter, onMouseLeave }: FileCardProps) {
  return (
    <CardRoot
      onClick={onOpen}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardInner>
        <IconWrap>
          <FileIcon />
        </IconWrap>

        <MetaWrap>
          <FileName>{item.name}</FileName>
          <BadgeRow>
            <StatusPill status={item.status} />
            <VersionBadge>
              <VersionText>version : {item.version}</VersionText>
            </VersionBadge>
            <DateText>{fmtDate(item.updatedAt)}</DateText>
          </BadgeRow>
        </MetaWrap>
      </CardInner>

      <MenuButton
        className="file-action"
        size="small"
        onClick={(e) => { e.stopPropagation(); onMenuOpen(e); }}
        disableRipple
      >
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </MenuButton>
    </CardRoot>
  );
}