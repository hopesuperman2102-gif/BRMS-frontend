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

function PageArrow({ direction, enabled, onClick }: {
  direction: 'prev' | 'next';
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={() => enabled && onClick()}
      sx={{
        width: 28,
        height: 28,
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: enabled ? 'pointer' : 'default',
        background: enabled ? 'rgba(99,102,241,0.15)' : 'transparent',
        border: `1px solid ${enabled ? brmsTheme.colors.indigoBase : brmsTheme.colors.slateGray}`,
        opacity: enabled ? 1 : 0.4,
        transition: 'all 0.15s',
        '&:hover': enabled ? { background: 'rgba(99,102,241,0.22)' } : {},
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path
          d={direction === 'prev' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
          stroke={enabled ? brmsTheme.colors.lightBorderHover : brmsTheme.colors.lightTextMid}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
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
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 680 },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: brmsTheme.colors.lightTextHigh,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          bgcolor: brmsTheme.colors.textDarkSlate,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: '6px', mr: 1 }}>
            {[brmsTheme.colors.errorRed, brmsTheme.colors.warningAmber, brmsTheme.colors.success].map((c) => (
              <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c, opacity: 0.8 }} />
            ))}
          </Box>
          <Typography fontWeight={700} fontSize="0.875rem" color={brmsTheme.colors.surfaceBase} letterSpacing="0.02em">
            Environment Logs
          </Typography>
          <Chip
            label={environment}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.65rem',
              bgcolor: envColor,
              color: brmsTheme.colors.white,
              height: 20,
              letterSpacing: '0.06em',
            }}
          />
          <FormControl size="small" sx={{ minWidth: 148 }}>
            <Select
              value={selectedDate}
              onChange={(e) => setSelectedDate(String(e.target.value))}
              disabled={loading || linesLoading}
              sx={{
                height: 24,
                color: brmsTheme.colors.lightTextMid,
                fontSize: '0.72rem',
                fontFamily: 'monospace',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: brmsTheme.colors.slateGray },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: brmsTheme.colors.slateGray },
                '& .MuiSelect-icon': { color: brmsTheme.colors.textGrayLight },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: brmsTheme.colors.lightTextHigh,
                    border: `1px solid ${brmsTheme.colors.slateGray}`,
                    mt: 0.5,
                  },
                },
              }}
            >
              {dateOptions.map((d) => (
                <MenuItem
                  key={d.value}
                  value={d.value}
                  sx={{
                    color: brmsTheme.colors.lightBorderHover,
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                  }}
                >
                  {d.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Refresh logs">
            <span>
              <IconButton
                size="small"
                onClick={() => void fetchLogs()}
                disabled={loading || linesLoading}
                sx={{ color: brmsTheme.colors.slateText, '&:hover': { color: brmsTheme.colors.surfaceBase } }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <IconButton size="small" onClick={onClose} sx={{ color: brmsTheme.colors.slateText, '&:hover': { color: brmsTheme.colors.surfaceBase } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          px: 2,
          py: 1.25,
          bgcolor: brmsTheme.colors.textDarkSlate,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {files.length === 0 ? (
          <Typography variant="caption" sx={{ color: brmsTheme.colors.slateText, fontFamily: 'monospace' }}>
            No log files found
          </Typography>
        ) : (
          <FormControl size="small" sx={{ minWidth: 320 }}>
            <Select
              value={selectedFile ?? ''}
              renderValue={(value) => String(value)}
              onChange={(e) => {
                const next = String(e.target.value);
                if (!next || next === selectedFile || linesLoading) return;
                setSelectedFile(next);
                void fetchPage(next, 0);
              }}
              disabled={loading || linesLoading}
              sx={{
                height: 30,
                color: brmsTheme.colors.lightBorder,
                fontSize: '0.72rem',
                fontFamily: 'monospace',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: brmsTheme.colors.slateGray },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: brmsTheme.colors.lightTextMid },
                '& .MuiSelect-icon': { color: brmsTheme.colors.lightTextLow },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: brmsTheme.colors.lightTextHigh,
                    border: `1px solid ${brmsTheme.colors.slateGray}`,
                    mt: 0.5,
                    maxHeight: 320,
                  },
                },
              }}
            >
              {files.map((f) => (
                <MenuItem
                  key={f.file_key}
                  value={f.file_key}
                  sx={{
                    color: brmsTheme.colors.lightBorderHover,
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Box component="span">{f.file_key}</Box>
                  <Box component="span" sx={{ color: brmsTheme.colors.lightTextLow }}>
                    {f.line_count ?? '-'}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 3,
          py: 1,
          bgcolor: brmsTheme.colors.textDarkSlate,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" sx={{ color: brmsTheme.colors.lightTextLow, fontFamily: 'monospace' }}>
          page {currentPage + 1} of {totalPages}
        </Typography>
        <Typography variant="caption" sx={{ color: brmsTheme.colors.slateGray, mx: 0.5 }}>|</Typography>
        <Typography variant="caption" sx={{ color: brmsTheme.colors.lightTextLow, fontFamily: 'monospace' }}>
          file {selectedFileIndex >= 0 ? selectedFileIndex + 1 : 0} of {files.length}
        </Typography>
        <Typography variant="caption" sx={{ color: brmsTheme.colors.slateGray, mx: 0.5 }}>|</Typography>
        <Typography variant="caption" sx={{ color: brmsTheme.colors.lightTextLow, fontFamily: 'monospace' }}>
          {selectedFile ?? '-'}
        </Typography>
        <Typography variant="caption" sx={{ color: brmsTheme.colors.slateGray, mx: 0.5 }}>|</Typography>
        <Typography variant="caption" sx={{ color: brmsTheme.colors.lightTextLow, fontFamily: 'monospace' }}>
          {selectedMeta?.created_at ? new Date(selectedMeta.created_at).toLocaleString() : '-'}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          py: 2,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: brmsTheme.colors.slateGray, borderRadius: 2 },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={24} sx={{ color: brmsTheme.colors.indigoBase }} />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body2" sx={{ color: brmsTheme.colors.errorRed, fontFamily: 'monospace' }}>{error}</Typography>
          </Box>
        ) : linesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={20} sx={{ color: brmsTheme.colors.indigoBase }} />
          </Box>
        ) : lines.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body2" sx={{ color: brmsTheme.colors.lightTextMid, fontFamily: 'monospace' }}>
              No logs found for {environment}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ px: 2 }}>
            {lines.map((line, idx) => {
              const cfg = getLevelConfig(line.level);
              return (
                <Box
                  key={`${line.timestamp}-${idx}`}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '152px 52px 1fr',
                    gap: 1.5,
                    alignItems: 'baseline',
                    px: 1.5,
                    py: '5px',
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                  }}
                >
                  <Typography sx={{ fontSize: '0.68rem', fontFamily: 'monospace', color: brmsTheme.colors.lightTextMid, whiteSpace: 'nowrap' }}>
                    {line.timestamp}
                  </Typography>

                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 0.75,
                      py: '1px',
                      borderRadius: '4px',
                      bgcolor: cfg.bg,
                      border: `1px solid ${cfg.color}22`,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.6rem', fontFamily: 'monospace', fontWeight: 700, color: cfg.color, letterSpacing: '0.05em' }}>
                      {cfg.label}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', minWidth: 0 }}>
                    <Typography
                      sx={{ fontSize: '0.68rem', fontFamily: 'monospace', color: brmsTheme.colors.indigoBase, whiteSpace: 'nowrap', flexShrink: 0 }}
                      title={line.source}
                    >
                      {line.source.split('.').pop()}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', fontFamily: 'monospace', color: brmsTheme.colors.slateGray, flexShrink: 0 }}>
                      &gt;
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', fontFamily: 'monospace', color: brmsTheme.colors.lightTextLow, wordBreak: 'break-word' }}>
                      {line.message}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          px: 2,
          py: '8px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          bgcolor: brmsTheme.colors.textDarkSlate,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography sx={{ fontSize: 11, color: brmsTheme.colors.lightTextLow, fontFamily: 'monospace', minWidth: 160 }}>
          {pageTotal === 0
            ? 'rows 0-0 of 0'
            : `rows ${currentPage * PAGE_SIZE + 1}-${Math.min((currentPage + 1) * PAGE_SIZE, pageTotal)} of ${pageTotal}`}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ px: 0.9, py: 0.4, borderRadius: '999px', bgcolor: `rgba(${brmsTheme.colors.success}20)`, border: `1px solid rgba(${brmsTheme.colors.success}45)` }}>
            <Typography sx={{ fontSize: 10, color: brmsTheme.colors.success, fontFamily: 'monospace' }}>INFO {levelStats.info}</Typography>
          </Box>
          <Box sx={{ px: 0.9, py: 0.4, borderRadius: '999px', bgcolor: `rgba(${brmsTheme.colors.warningAmber}20)`, border: `1px solid rgba(${brmsTheme.colors.warningAmber}45)` }}>
            <Typography sx={{ fontSize: 10, color: brmsTheme.colors.warningAmber, fontFamily: 'monospace' }}>WARN {levelStats.warn}</Typography>
          </Box>
          <Box sx={{ px: 0.9, py: 0.4, borderRadius: '999px', bgcolor: `rgba(${brmsTheme.colors.errorRed}20)`, border: `1px solid rgba(${brmsTheme.colors.errorRed}45)` }}>
            <Typography sx={{ fontSize: 10, color: brmsTheme.colors.errorRed, fontFamily: 'monospace' }}>ERROR {levelStats.error}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <PageArrow
            direction="prev"
            enabled={hasPrev && !linesLoading && !!selectedFile}
            onClick={() => selectedFile && void fetchPage(selectedFile, currentPage - 1)}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            {Array.from({ length: totalPages }, (_, i) => {
              const isActive = i === currentPage;
              const nearCurrent = Math.abs(i - currentPage) <= 1;
              const isEdge = i === 0 || i === totalPages - 1;
              const showEllBefore = i === currentPage - 2 && currentPage > 2;
              const showEllAfter = i === currentPage + 2 && currentPage < totalPages - 3;

              if (showEllBefore || showEllAfter) {
                return (
                  <Typography key={`ellipsis-${i}`} sx={{ fontSize: 11, color: brmsTheme.colors.slateText, px: '2px', userSelect: 'none', fontFamily: 'monospace' }}>
                    ...
                  </Typography>
                );
              }
              if (!isEdge && !nearCurrent) return null;

              return (
                <Box
                  key={i}
                  onClick={() => selectedFile && !linesLoading && void fetchPage(selectedFile, i)}
                  sx={{
                    minWidth: 26,
                    height: 26,
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: linesLoading || !selectedFile ? 'default' : 'pointer',
                    background: isActive ? brmsTheme.colors.indigoBase : 'transparent',
                    border: `1px solid ${isActive ? brmsTheme.colors.indigoBase : brmsTheme.colors.slateGray}`,
                    transition: 'all 0.12s',
                    '&:hover': !isActive ? { background: 'rgba(99,102,241,0.15)' } : {},
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: isActive ? 800 : 500,
                      color: isActive ? brmsTheme.colors.surfaceBase : brmsTheme.colors.lightTextLow,
                      fontFamily: 'monospace',
                      userSelect: 'none',
                    }}
                  >
                    {i + 1}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <PageArrow
            direction="next"
            enabled={hasNext && !linesLoading && !!selectedFile}
            onClick={() => selectedFile && void fetchPage(selectedFile, currentPage + 1)}
          />
        </Box>

        <Typography sx={{ fontSize: 10, color: brmsTheme.colors.slateText, fontFamily: 'monospace', textAlign: 'right', minWidth: 160 }}>
          {pageTotal} total lines
        </Typography>
      </Box>
    </Drawer>
  );
};
