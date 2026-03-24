import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AnimatePresence, motion } from 'framer-motion';
import RcLogPagination from '@/core/components/RcLogPagination';
import RcLogLevelStats from '@/core/components/RcLogLevelStats';
import { countLogLevels } from '@/modules/logs/utils/envLogsUtils';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { LogViewerPanelProps, ParsedLogLine } from '../types/auditLogsTypes';

const { colors, fonts, gradients, shadows } = brmsTheme;
const MotionBox = motion(Box);

const LEVEL_CFG = {
  INFO: {
    color: colors.info,
    bg: colors.statusDefaultBg,
    border: colors.statusDefaultBorder,
    label: 'INFO',
  },
  WARNING: {
    color: colors.warning,
    bg: colors.statusInactiveBg,
    border: colors.statusInactiveBorder,
    label: 'WARN',
  },
  ERROR: {
    color: colors.error,
    bg: colors.errorBg,
    border: colors.errorBorder,
    label: 'ERR',
  },
} as const;

const ViewerCard = styled(MotionBox)({
  background: colors.white,
  border: `1px solid ${colors.lightBorder}`,
  borderRadius: 10,
  overflow: 'hidden',
});

const TopBar = styled(Box)({
  padding: '10px 16px',
  background: colors.surfaceBase,
  borderBottom: `1px solid ${colors.lightBorder}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 8,
});

const TopLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

const FileKeyPill = styled(Box)({
  padding: '3px 8px',
  borderRadius: 5,
  background: colors.primaryGlowSoft,
  border: `1px solid ${colors.primaryGlowMid}`,
});

const FileKeyText = styled(Typography)({
  fontSize: 11,
  fontWeight: 700,
  color: colors.primary,
  fontFamily: fonts.mono,
});

const MetaText = styled(Typography)({
  fontSize: 10,
  color: colors.lightTextLow,
  fontFamily: fonts.mono,
});

const HeaderRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '44px 72px 160px 1fr',
  padding: '5px 16px',
  background: colors.bgGrayLight,
  borderBottom: `1px solid ${colors.lightBorder}`,
});

const HeaderCell = styled(Typography)({
  fontSize: 9,
  fontWeight: 800,
  color: colors.lightTextLow,
  letterSpacing: '0.1em',
  fontFamily: fonts.mono,
});

const HeaderCellPad = styled(HeaderCell, {
  shouldForwardProp: (prop) => prop !== 'padded',
})<{ padded: boolean }>(({ padded }) => ({
  paddingLeft: padded ? 6 : 0,
}));

const LogRowRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'odd',
})<{ odd: boolean }>(({ odd }) => ({
  display: 'grid',
  gridTemplateColumns: '44px 72px 160px 1fr',
  alignItems: 'center',
  padding: '5px 16px',
  borderBottom: `1px solid ${colors.lightBorder}`,
  background: odd ? colors.surfaceBase : colors.white,
  transition: 'background 0.1s',
  '&:hover': { background: colors.primaryGlowSoft },
}));

const LevelPill = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'pillbg' && prop !== 'pillborder',
})<{ pillbg: string; pillborder: string }>(({ pillbg, pillborder }) => ({
  padding: '1px 5px',
  borderRadius: 3,
  background: pillbg,
  border: `1px solid ${pillborder}`,
  display: 'inline-flex',
  justifyContent: 'center',
  width: 'fit-content',
}));

const LevelText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'textcolor',
})<{ textcolor: string }>(({ textcolor }) => ({
  fontSize: 9,
  fontWeight: 800,
  color: textcolor,
  letterSpacing: '0.05em',
  fontFamily: fonts.mono,
}));

const CellTime = styled(Typography)({
  fontSize: 11,
  color: colors.lightTextLow,
  fontFamily: fonts.mono,
  paddingLeft: 6,
});

const CellSource = styled(Typography)({
  fontSize: 11,
  fontFamily: fonts.mono,
  padding: '0 6px',
  color: colors.panelIndigo,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const CellMessage = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'messagecolor',
})<{ messagecolor: string }>(({ messagecolor }) => ({
  fontSize: 12,
  fontFamily: fonts.mono,
  lineHeight: 1.4,
  wordBreak: 'break-all',
  color: messagecolor,
}));

const StateWrap = styled(Box)({
  padding: '48px 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
});

const LoadingSpinner = styled(CircularProgress)({
  color: colors.primary,
});

const EmptyWrap = styled(Box)({
  padding: '48px 0',
  textAlign: 'center',
});

const FooterBar = styled(Box)({
  padding: '8px 16px',
  borderTop: `1px solid ${colors.lightBorder}`,
  background: colors.surfaceBase,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const FooterLeft = styled(Typography)({
  fontSize: 11,
  color: colors.lightTextLow,
  fontFamily: fonts.mono,
  minWidth: 160,
});

const FooterRight = styled(Typography)({
  fontSize: 10,
  color: colors.lightTextLow,
  fontFamily: fonts.mono,
  textAlign: 'right',
  minWidth: 160,
});

function LogLine({ line, index }: { line: ParsedLogLine; index: number }) {
  const cfg = LEVEL_CFG[line.level as keyof typeof LEVEL_CFG] ?? LEVEL_CFG.INFO;
  const messageColor =
    line.level === 'ERROR'
      ? colors.error
      : line.level === 'WARNING'
        ? colors.warning
        : colors.lightTextHigh;

  return (
    <LogRowRoot odd={index % 2 === 1}>
      <LevelPill pillbg={cfg.bg} pillborder={cfg.border}>
        <LevelText textcolor={cfg.color}>{cfg.label}</LevelText>
      </LevelPill>
      <CellTime>{line.timestamp.split(' ')[1]}</CellTime>
      <CellSource>{line.source.split('.').slice(-2).join('.')}</CellSource>
      <CellMessage messagecolor={messageColor}>{line.message}</CellMessage>
    </LogRowRoot>
  );
}

export default function LogViewerPanel({
  activeEntry,
  visibleLines,
  currentPage,
  totalPages,
  pageTotal,
  pageSize,
  linesLoading,
  selectedFile,
  onPageChange,
  formatCreatedAt,
}: LogViewerPanelProps) {
  const pageLevelStats = countLogLevels(visibleLines, (line) => line.level);

  return (
    <AnimatePresence mode='wait'>
      {activeEntry ? (
        <ViewerCard
          key={activeEntry.file_key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <TopBar>
            <TopLeft>
              <FileKeyPill>
                <FileKeyText>{activeEntry.file_key}</FileKeyText>
              </FileKeyPill>
              <MetaText>page {currentPage + 1} of {totalPages}</MetaText>
              {activeEntry.created_at ? <MetaText>. {formatCreatedAt(activeEntry.created_at)}</MetaText> : null}
            </TopLeft>

            {!linesLoading && visibleLines.length > 0 ? (
              <RcLogLevelStats
                label='this page:'
                labelColor={colors.lightTextLow}
                showDot
                items={[
                  {
                    key: 'info',
                    label: LEVEL_CFG.INFO.label,
                    count: pageLevelStats.info,
                    color: LEVEL_CFG.INFO.color,
                    background: LEVEL_CFG.INFO.bg,
                    border: LEVEL_CFG.INFO.border,
                  },
                  {
                    key: 'warn',
                    label: LEVEL_CFG.WARNING.label,
                    count: pageLevelStats.warn,
                    color: LEVEL_CFG.WARNING.color,
                    background: LEVEL_CFG.WARNING.bg,
                    border: LEVEL_CFG.WARNING.border,
                  },
                  {
                    key: 'error',
                    label: LEVEL_CFG.ERROR.label,
                    count: pageLevelStats.error,
                    color: LEVEL_CFG.ERROR.color,
                    background: LEVEL_CFG.ERROR.bg,
                    border: LEVEL_CFG.ERROR.border,
                  },
                ]}
                fontFamily={fonts.mono}
              />
            ) : null}
          </TopBar>

          <HeaderRow>
            {['LEVEL', 'TIME', 'SOURCE', 'MESSAGE'].map((header, index) => (
              <HeaderCellPad key={header} padded={index > 0}>
                {header}
              </HeaderCellPad>
            ))}
          </HeaderRow>

          <AnimatePresence mode='wait'>
            <MotionBox
              key={`${activeEntry.file_key}-p${currentPage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {linesLoading ? (
                <StateWrap>
                  <LoadingSpinner size={20} />
                  <MetaText>Fetching page {currentPage + 1}...</MetaText>
                </StateWrap>
              ) : visibleLines.length === 0 ? (
                <EmptyWrap>
                  <MetaText>- no events on this page -</MetaText>
                </EmptyWrap>
              ) : (
                visibleLines.map((line, index) => <LogLine key={index} line={line} index={index} />)
              )}
            </MotionBox>
          </AnimatePresence>

          <FooterBar>
            <FooterLeft>
              {linesLoading
                ? 'loading...'
                : `rows ${currentPage * pageSize + 1}-${Math.min((currentPage + 1) * pageSize, pageTotal)} of ${pageTotal}`}
            </FooterLeft>

            <RcLogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              disabled={linesLoading || !selectedFile}
              onPageChange={onPageChange}
              fontFamily={fonts.mono}
              palette={{
                activeBackground: gradients.primary,
                activeBorder: colors.primary,
                activeText: colors.textOnPrimary,
                inactiveBorder: colors.lightBorder,
                inactiveText: colors.lightTextMid,
                inactiveHoverBackground: colors.primaryGlowSoft,
                arrowEnabledBackground: colors.primaryGlowSoft,
                arrowEnabledBorder: colors.primaryGlowMid,
                arrowDisabledBorder: colors.lightBorder,
                arrowEnabledIcon: colors.primary,
                arrowDisabledIcon: colors.lightTextLow,
                ellipsisText: colors.lightTextLow,
                activeShadow: shadows.primarySoft,
              }}
            />

            <FooterRight>{pageTotal} total lines</FooterRight>
          </FooterBar>
        </ViewerCard>
      ) : null}
    </AnimatePresence>
  );
}
