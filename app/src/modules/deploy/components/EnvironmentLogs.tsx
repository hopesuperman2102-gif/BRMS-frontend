'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import { deployApi } from '@/modules/deploy/api/deployApi';
import { EnvironmentLogsProps, ParsedEnvLogLine } from '@/modules/deploy/types/deployTypes';
import { RawEnvLogFileMeta } from '@/modules/deploy/types/deployEndpointsTypes';
import { brmsTheme } from '@/core/theme/brmsTheme';

const PAGE_SIZE = 10;
const DATE_LOOKBACK_DAYS = 14;

function formatLocalDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const parseLogLine = (line: string): ParsedEnvLogLine | null => {
  const parts = line.split(/\s*\|\s*/);
  if (parts.length >= 4) {
    return {
      timestamp: parts[0].trim(),
      level: parts[1].trim(),
      source: parts[2].trim(),
      message: parts.slice(3).join(' | ').trim(),
    };
  }
  return null;
};

const LEVEL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  INFO: { color: brmsTheme.colors.success, bg: `rgba(${brmsTheme.colors.success}20)`, label: 'INFO' },
  ERROR: { color: brmsTheme.colors.errorRed, bg: `rgba(${brmsTheme.colors.errorRed}20)`, label: 'ERROR' },
  WARN: { color: brmsTheme.colors.warningAmber, bg: `rgba(${brmsTheme.colors.warningAmber}20)`, label: 'WARN' },
  WARNING: { color: brmsTheme.colors.warningAmber, bg: `rgba(${brmsTheme.colors.warningAmber}20)`, label: 'WARN' },
  DEBUG: { color: brmsTheme.colors.chartBlueLight, bg: `rgba(${brmsTheme.colors.chartBlueLight}20)`, label: 'DEBUG' },
};

const getLevelConfig = (level: string) =>
  LEVEL_CONFIG[level.toUpperCase()] ?? { color: brmsTheme.colors.lightTextLow, bg: `rgba(${brmsTheme.colors.lightTextLow}20)`, label: level };

const ENV_COLORS: Record<string, string> = {
  PROD: brmsTheme.colors.errorRed,
  QA: brmsTheme.colors.warningAmber,
  DEV: brmsTheme.colors.indigoBase,
};

function countLevels(lines: ParsedEnvLogLine[]): { info: number; warn: number; error: number } {
  return lines.reduce(
    (acc, line) => {
      const level = line.level.toUpperCase();
      if (level === 'INFO') acc.info += 1;
      else if (level === 'WARN' || level === 'WARNING') acc.warn += 1;
      else if (level === 'ERROR') acc.error += 1;
      return acc;
    },
    { info: 0, warn: 0, error: 0 },
  );
}

const StyledDrawer = styled(Drawer)({
  '& .MuiDrawer-paper': {
    width: 680,
    maxWidth: '100vw',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: brmsTheme.colors.lightTextHigh,
  },
  '@media (max-width: 600px)': {
    '& .MuiDrawer-paper': {
      width: '100vw',
    },
  },
});

const DarkBar = styled(Box)({
  backgroundColor: brmsTheme.colors.textDarkSlate,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  flexShrink: 0,
});

const HeaderBar = styled(DarkBar)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 24px',
});

const HeaderLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

const HeaderActions = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

const HeaderTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: '0.985rem',
  color: brmsTheme.colors.surfaceBase,
  letterSpacing: '0.02em',
});

const EnvironmentChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'envcolor',
})<{ envcolor: string }>(({ envcolor }) => ({
  fontWeight: 800,
  fontSize: '0.65rem',
  backgroundColor: envcolor,
  color: brmsTheme.colors.white,
  height: 20,
  letterSpacing: '0.06em',
}));

const DateControl = styled(FormControl)({ minWidth: 148 });
const FileControl = styled(FormControl)({ minWidth: 320 });

const DateSelect = styled(Select)({
  height: 24,
  color: brmsTheme.colors.lightTextMid,
  fontSize: '0.72rem',
  fontFamily: 'monospace',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: brmsTheme.colors.slateGray },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: brmsTheme.colors.slateGray },
  '& .MuiSelect-icon': { color: brmsTheme.colors.textGrayLight },
});

const FileSelect = styled(Select)({
  height: 30,
  color: brmsTheme.colors.lightBorder,
  fontSize: '0.72rem',
  fontFamily: 'monospace',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: brmsTheme.colors.slateGray },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: brmsTheme.colors.lightTextMid },
  '& .MuiSelect-icon': { color: brmsTheme.colors.lightTextLow },
});

const DateMenuItem = styled(MenuItem)({
  color: brmsTheme.colors.lightBorderHover,
  fontSize: '0.75rem',
  fontFamily: 'monospace',
});

const FileMenuItem = styled(MenuItem)({
  color: brmsTheme.colors.lightBorderHover,
  fontSize: '0.75rem',
  fontFamily: 'monospace',
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
});

const FileMeta = styled(Box)({ color: brmsTheme.colors.lightTextLow });

const HeaderIconButton = styled(IconButton)({
  color: brmsTheme.colors.slateText,
  '&:hover': { color: brmsTheme.colors.surfaceBase },
});

const FileBar = styled(DarkBar)({
  padding: '10px 16px',
  display: 'flex',
  alignItems: 'center',
});

const FileCaption = styled(Typography)({
  color: brmsTheme.colors.slateText,
  fontFamily: 'monospace',
});

const MetaBar = styled(DarkBar)({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '8px 24px',
});

const MetaText = styled(Typography)({
  color: brmsTheme.colors.lightTextLow,
  fontFamily: 'monospace',
});

const MetaDivider = styled(Typography)({
  color: brmsTheme.colors.slateGray,
  marginLeft: 4,
  marginRight: 4,
});

const LogBody = styled(Box)({
  flex: 1,
  overflow: 'auto',
  paddingTop: 16,
  paddingBottom: 16,
  '&::-webkit-scrollbar': { width: 4 },
  '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
  '&::-webkit-scrollbar-thumb': { backgroundColor: brmsTheme.colors.slateGray, borderRadius: 2 },
});

const CenterState = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
});

const CenterError = styled(Typography)({
  color: brmsTheme.colors.errorRed,
  fontFamily: 'monospace',
});

const CenterEmpty = styled(Typography)({
  color: brmsTheme.colors.lightTextMid,
  fontFamily: 'monospace',
});

const LoadingSpinner = styled(CircularProgress)({
  color: brmsTheme.colors.indigoBase,
});

const BodyPadding = styled(Box)({
  paddingLeft: 16,
  paddingRight: 16,
});

const LogRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '152px 52px 1fr',
  gap: 12,
  alignItems: 'baseline',
  padding: '5px 12px',
  borderRadius: 4,
  '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' },
});

const TimestampText = styled(Typography)({
  fontSize: '0.68rem',
  fontFamily: 'monospace',
  color: brmsTheme.colors.lightTextMid,
  whiteSpace: 'nowrap',
});

const LevelBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'badgebg' && prop !== 'badgeborder',
})<{ badgebg: string; badgeborder: string }>(({ badgebg, badgeborder }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1px 6px',
  borderRadius: 4,
  backgroundColor: badgebg,
  border: `1px solid ${badgeborder}`,
}));

const LevelText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'textcolor',
})<{ textcolor: string }>(({ textcolor }) => ({
  fontSize: '0.6rem',
  fontFamily: 'monospace',
  fontWeight: 700,
  color: textcolor,
  letterSpacing: '0.05em',
}));

const MessageRow = styled(Box)({
  display: 'flex',
  gap: 8,
  alignItems: 'baseline',
  minWidth: 0,
});

const SourceText = styled(Typography)({
  fontSize: '0.68rem',
  fontFamily: 'monospace',
  color: brmsTheme.colors.indigoBase,
  whiteSpace: 'nowrap',
  flexShrink: 0,
});

const ArrowText = styled(Typography)({
  fontSize: '0.68rem',
  fontFamily: 'monospace',
  color: brmsTheme.colors.slateGray,
  flexShrink: 0,
});

const MessageText = styled(Typography)({
  fontSize: '0.72rem',
  fontFamily: 'monospace',
  color: brmsTheme.colors.lightTextLow,
  wordBreak: 'break-word',
});

const FooterBar = styled(Box)({
  padding: '8px 16px',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  backgroundColor: brmsTheme.colors.textDarkSlate,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  flexWrap: 'wrap',
});

const FooterText = styled(Typography)({
  fontSize: 11,
  color: brmsTheme.colors.lightTextLow,
  fontFamily: 'monospace',
  minWidth: 160,
});

const FooterRightText = styled(Typography)({
  fontSize: 10,
  color: brmsTheme.colors.slateText,
  fontFamily: 'monospace',
  textAlign: 'right',
  minWidth: 160,
});

const StatsGroup = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

const StatPill = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'pillbg' && prop !== 'pillborder',
})<{ pillbg: string; pillborder: string }>(({ pillbg, pillborder }) => ({
  padding: '3px 7px',
  borderRadius: 999,
  backgroundColor: pillbg,
  border: `1px solid ${pillborder}`,
}));

const StatText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'textcolor',
})<{ textcolor: string }>(({ textcolor }) => ({
  fontSize: 10,
  color: textcolor,
  fontFamily: 'monospace',
}));

const PagerGroup = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 5,
});

const PageList = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 3,
});

const EllipsisText = styled(Typography)({
  fontSize: 11,
  color: brmsTheme.colors.slateText,
  paddingLeft: 2,
  paddingRight: 2,
  userSelect: 'none',
  fontFamily: 'monospace',
});

const PageButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'disabledstate',
})<{ active: boolean; disabledstate: boolean }>(({ active, disabledstate }) => ({
  minWidth: 26,
  height: 26,
  borderRadius: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: disabledstate ? 'default' : 'pointer',
  backgroundColor: active ? brmsTheme.colors.indigoBase : 'transparent',
  border: `1px solid ${active ? brmsTheme.colors.indigoBase : brmsTheme.colors.slateGray}`,
  transition: 'all 0.12s',
  '&:hover': !active && !disabledstate ? { backgroundColor: 'rgba(99,102,241,0.15)' } : {},
}));

const PageButtonText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ active }) => ({
  fontSize: 11,
  fontWeight: active ? 800 : 500,
  color: active ? brmsTheme.colors.surfaceBase : brmsTheme.colors.lightTextLow,
  fontFamily: 'monospace',
  userSelect: 'none',
}));

const ArrowButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'enabled',
})<{ enabled: boolean }>(({ enabled }) => ({
  width: 28,
  height: 28,
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: enabled ? 'pointer' : 'default',
  backgroundColor: enabled ? 'rgba(99,102,241,0.15)' : 'transparent',
  border: `1px solid ${enabled ? brmsTheme.colors.indigoBase : brmsTheme.colors.slateGray}`,
  opacity: enabled ? 1 : 0.4,
  transition: 'all 0.15s',
  '&:hover': enabled ? { backgroundColor: 'rgba(99,102,241,0.22)' } : {},
}));

function PageArrow({ direction, enabled, onClick }: {
  direction: 'prev' | 'next';
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <ArrowButton enabled={enabled} onClick={() => enabled && onClick()}>
      <svg width='12' height='12' viewBox='0 0 24 24' fill='none'>
        <path
          d={direction === 'prev' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
          stroke={enabled ? brmsTheme.colors.lightBorderHover : brmsTheme.colors.lightTextMid}
          strokeWidth='2.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </ArrowButton>
  );
}

export const EnvironmentLogs: React.FC<EnvironmentLogsProps> = ({
  open,
  environment,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(formatLocalDateYYYYMMDD(new Date()));
  const [files, setFiles] = useState<RawEnvLogFileMeta[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [lines, setLines] = useState<ParsedEnvLogLine[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageTotal, setPageTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [linesLoading, setLinesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateOptions = useMemo(() => {
    const base = new Date();
    return Array.from({ length: DATE_LOOKBACK_DAYS }, (_, idx) => {
      const d = new Date(base);
      d.setDate(base.getDate() - idx);
      const value = formatLocalDateYYYYMMDD(d);
      return { value, label: formatDateLabel(value) };
    });
  }, []);

  const fetchPage = useCallback(async (fileKey: string, page: number) => {
    setLinesLoading(true);
    try {
      const res = await deployApi.getEnvironmentLogPage(environment, fileKey, page * PAGE_SIZE);
      const parsed = res.data
        .filter((l) => l.trim())
        .map(parseLogLine)
        .filter(Boolean) as ParsedEnvLogLine[];
      setLines(parsed);
      setCurrentPage(page);
      setPageTotal(res.total);
    } catch {
      setError('Failed to load log page. Please try again.');
      setLines([]);
      setPageTotal(0);
    } finally {
      setLinesLoading(false);
    }
  }, [environment]);

  const fetchLogs = useCallback(async () => {
    if (!environment) return;
    setLoading(true);
    setError(null);
    try {
      const fileList = await deployApi.getEnvironmentLogFiles(environment, selectedDate);
      setFiles(fileList);
      if (!fileList.length) {
        setSelectedFile(null);
        setLines([]);
        setPageTotal(0);
        setCurrentPage(0);
        return;
      }
      const first = fileList[0].file_key;
      setSelectedFile(first);
      await fetchPage(first, 0);
    } catch {
      setError('Failed to load logs. Please try again.');
      setFiles([]);
      setSelectedFile(null);
      setLines([]);
      setPageTotal(0);
      setCurrentPage(0);
    } finally {
      setLoading(false);
    }
  }, [environment, fetchPage, selectedDate]);

  useEffect(() => {
    if (open) {
      void fetchLogs();
    } else {
      setSelectedDate(formatLocalDateYYYYMMDD(new Date()));
      setFiles([]);
      setSelectedFile(null);
      setLines([]);
      setError(null);
      setCurrentPage(0);
      setPageTotal(0);
      setLoading(false);
      setLinesLoading(false);
    }
  }, [open, fetchLogs]);

  const envColor = ENV_COLORS[environment] ?? brmsTheme.colors.indigoBase;
  const totalPages = Math.max(1, Math.ceil(pageTotal / PAGE_SIZE));
  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;
  const selectedMeta = useMemo(
    () => files.find((f) => f.file_key === selectedFile),
    [files, selectedFile],
  );
  const selectedFileIndex = useMemo(
    () => files.findIndex((f) => f.file_key === selectedFile),
    [files, selectedFile],
  );
  const levelStats = useMemo(() => countLevels(lines), [lines]);

  return (
    <StyledDrawer anchor='right' open={open} onClose={onClose}>
      <HeaderBar>
        <HeaderLeft>
          <HeaderTitle>Environment Logs</HeaderTitle>
          <EnvironmentChip label={environment} size='small' envcolor={envColor} />
          <DateControl size='small'>
            <DateSelect
              value={selectedDate}
              onChange={(e) => setSelectedDate(String(e.target.value))}
              disabled={loading || linesLoading}
              MenuProps={{
                PaperProps: {
                  style: {
                    backgroundColor: brmsTheme.colors.lightTextHigh,
                    border: `1px solid ${brmsTheme.colors.slateGray}`,
                    marginTop: 4,
                  },
                },
              }}
            >
              {dateOptions.map((d) => (
                <DateMenuItem key={d.value} value={d.value}>
                  {d.label}
                </DateMenuItem>
              ))}
            </DateSelect>
          </DateControl>
        </HeaderLeft>

        <HeaderActions>
          <Tooltip title='Refresh logs'>
            <span>
              <HeaderIconButton
                size='small'
                onClick={() => void fetchLogs()}
                disabled={loading || linesLoading}
              >
                <RefreshIcon fontSize='small' />
              </HeaderIconButton>
            </span>
          </Tooltip>
          <HeaderIconButton size='small' onClick={onClose}>
            <CloseIcon fontSize='small' />
          </HeaderIconButton>
        </HeaderActions>
      </HeaderBar>

      <FileBar>
        {files.length === 0 ? (
          <FileCaption variant='caption'>No log files found</FileCaption>
        ) : (
          <FileControl size='small'>
            <FileSelect
              value={selectedFile ?? ''}
              renderValue={(value) => String(value)}
              onChange={(e) => {
                const next = String(e.target.value);
                if (!next || next === selectedFile || linesLoading) return;
                setSelectedFile(next);
                void fetchPage(next, 0);
              }}
              disabled={loading || linesLoading}
              MenuProps={{
                PaperProps: {
                  style: {
                    backgroundColor: brmsTheme.colors.lightTextHigh,
                    border: `1px solid ${brmsTheme.colors.slateGray}`,
                    marginTop: 4,
                    maxHeight: 320,
                  },
                },
              }}
            >
              {files.map((f) => (
                <FileMenuItem key={f.file_key} value={f.file_key}>
                  <Box component='span'>{f.file_key}</Box>
                  <FileMeta as="span">{f.line_count ?? '-'}</FileMeta>
                </FileMenuItem>
              ))}
            </FileSelect>
          </FileControl>
        )}
      </FileBar>

      <MetaBar>
        <MetaText variant='caption'>page {currentPage + 1} of {totalPages}</MetaText>
        <MetaDivider variant='caption'>|</MetaDivider>
        <MetaText variant='caption'>file {selectedFileIndex >= 0 ? selectedFileIndex + 1 : 0} of {files.length}</MetaText>
        <MetaDivider variant='caption'>|</MetaDivider>
        <MetaText variant='caption'>{selectedFile ?? '-'}</MetaText>
        <MetaDivider variant='caption'>|</MetaDivider>
        <MetaText variant='caption'>{selectedMeta?.created_at ? new Date(selectedMeta.created_at).toLocaleString() : '-'}</MetaText>
      </MetaBar>

      <LogBody>
        {loading ? (
          <CenterState>
            <LoadingSpinner size={24} />
          </CenterState>
        ) : error ? (
          <CenterState>
            <CenterError variant='body2'>{error}</CenterError>
          </CenterState>
        ) : linesLoading ? (
          <CenterState>
            <LoadingSpinner size={20} />
          </CenterState>
        ) : lines.length === 0 ? (
          <CenterState>
            <CenterEmpty variant='body2'>No logs found for {environment}</CenterEmpty>
          </CenterState>
        ) : (
          <BodyPadding>
            {lines.map((line, idx) => {
              const cfg = getLevelConfig(line.level);
              return (
                <LogRow key={`${line.timestamp}-${idx}`}>
                  <TimestampText>{line.timestamp}</TimestampText>

                  <LevelBadge badgebg={cfg.bg} badgeborder={`${cfg.color}22`}>
                    <LevelText textcolor={cfg.color}>{cfg.label}</LevelText>
                  </LevelBadge>

                  <MessageRow>
                    <SourceText title={line.source}>{line.source.split('.').pop()}</SourceText>
                    <ArrowText>&gt;</ArrowText>
                    <MessageText>{line.message}</MessageText>
                  </MessageRow>
                </LogRow>
              );
            })}
          </BodyPadding>
        )}
      </LogBody>

      <FooterBar>
        <FooterText>
          {pageTotal === 0
            ? 'rows 0-0 of 0'
            : `rows ${currentPage * PAGE_SIZE + 1}-${Math.min((currentPage + 1) * PAGE_SIZE, pageTotal)} of ${pageTotal}`}
        </FooterText>

        <StatsGroup>
          <StatPill pillbg={`rgba(${brmsTheme.colors.success}20)`} pillborder={`rgba(${brmsTheme.colors.success}45)`}>
            <StatText textcolor={brmsTheme.colors.success}>INFO {levelStats.info}</StatText>
          </StatPill>
          <StatPill pillbg={`rgba(${brmsTheme.colors.warningAmber}20)`} pillborder={`rgba(${brmsTheme.colors.warningAmber}45)`}>
            <StatText textcolor={brmsTheme.colors.warningAmber}>WARN {levelStats.warn}</StatText>
          </StatPill>
          <StatPill pillbg={`rgba(${brmsTheme.colors.errorRed}20)`} pillborder={`rgba(${brmsTheme.colors.errorRed}45)`}>
            <StatText textcolor={brmsTheme.colors.errorRed}>ERROR {levelStats.error}</StatText>
          </StatPill>
        </StatsGroup>

        <PagerGroup>
          <PageArrow
            direction='prev'
            enabled={hasPrev && !linesLoading && !!selectedFile}
            onClick={() => selectedFile && void fetchPage(selectedFile, currentPage - 1)}
          />

          <PageList>
            {Array.from({ length: totalPages }, (_, i) => {
              const isActive = i === currentPage;
              const nearCurrent = Math.abs(i - currentPage) <= 1;
              const isEdge = i === 0 || i === totalPages - 1;
              const showEllBefore = i === currentPage - 2 && currentPage > 2;
              const showEllAfter = i === currentPage + 2 && currentPage < totalPages - 3;

              if (showEllBefore || showEllAfter) {
                return <EllipsisText key={`ellipsis-${i}`}>...</EllipsisText>;
              }
              if (!isEdge && !nearCurrent) return null;

              return (
                <PageButton
                  key={i}
                  active={isActive}
                  disabledstate={linesLoading || !selectedFile}
                  onClick={() => selectedFile && !linesLoading && void fetchPage(selectedFile, i)}
                >
                  <PageButtonText active={isActive}>{i + 1}</PageButtonText>
                </PageButton>
              );
            })}
          </PageList>

          <PageArrow
            direction='next'
            enabled={hasNext && !linesLoading && !!selectedFile}
            onClick={() => selectedFile && void fetchPage(selectedFile, currentPage + 1)}
          />
        </PagerGroup>

        <FooterRightText>{pageTotal} total lines</FooterRightText>
      </FooterBar>
    </StyledDrawer>
  );
};
