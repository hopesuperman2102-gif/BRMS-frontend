'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import { deployApi } from '../api/deployApi';

/* ─── Types ─────────────────────────────────────────────────── */

interface LogEntry {
  id: string;
  content: string;
  file_key: string;
  environment: string;
  created_at: string;
}

interface ParsedLogLine {
  timestamp: string;
  level: string;
  source: string;
  message: string;
}

interface EnvironmentLogsProps {
  open: boolean;
  environment: string;
  onClose: () => void;
}

/* ─── Helpers ───────────────────────────────────────────────── */

const parseLogLine = (line: string): ParsedLogLine | null => {
  // split on | with optional surrounding spaces
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
  INFO:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'INFO'  },
  ERROR:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'ERROR' },
  WARN:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'WARN'  },
  WARNING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'WARN'  },
  DEBUG:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  label: 'DEBUG' },
};

const getLevelConfig = (level: string) =>
  LEVEL_CONFIG[level.toUpperCase()] ?? { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: level };

const ENV_COLORS: Record<string, string> = {
  PROD: '#ef4444',
  QA:   '#f59e0b',
  DEV:  '#6366f1',
};

/* ─── Component ─────────────────────────────────────────────── */

export const EnvironmentLogs: React.FC<EnvironmentLogsProps> = ({
  open,
  environment,
  onClose,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    if (!environment) return;
    setLoading(true);
    setError(null);
    try {
      const data = await deployApi.getEnvironmentLogs(environment);
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setError('Failed to load logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchLogs();
    else { setLogs([]); setError(null); }
  }, [open, environment]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading && logs.length > 0) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [loading, logs]);

  const allLines = logs.flatMap((entry) =>
    entry.content.split('\n').filter((l) => l.trim()).map(parseLogLine).filter(Boolean) as ParsedLogLine[]
  );

  const envColor = ENV_COLORS[environment] ?? '#6366f1';

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
          bgcolor: '#0f172a',  // dark terminal background
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 2,
        bgcolor: '#1e293b',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Terminal dot decorations */}
          <Box sx={{ display: 'flex', gap: '6px', mr: 1 }}>
            {['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
              <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c, opacity: 0.8 }} />
            ))}
          </Box>
          <Typography fontWeight={700} fontSize="0.875rem" color="#f1f5f9" letterSpacing="0.02em">
            Environment Logs
          </Typography>
          <Chip
            label={environment}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.65rem',
              bgcolor: envColor,
              color: '#fff',
              height: 20,
              letterSpacing: '0.06em',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Refresh logs">
            <span>
              <IconButton size="small" onClick={fetchLogs} disabled={loading}
                sx={{ color: '#64748b', '&:hover': { color: '#f1f5f9' } }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <IconButton size="small" onClick={onClose}
            sx={{ color: '#64748b', '&:hover': { color: '#f1f5f9' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* ── Meta bar ───────────────────────────────────────── */}
      {logs.length > 0 && !loading && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 3,
          py: 1,
          bgcolor: '#1e293b',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <Typography variant="caption" sx={{ color: '#475569', fontFamily: 'monospace' }}>
            <Box component="span" sx={{ color: '#22c55e', mr: 0.5 }}>●</Box>
            {allLines.length} entries
          </Typography>
          <Typography variant="caption" sx={{ color: '#334155', mx: 0.5 }}>│</Typography>
          <Typography variant="caption" sx={{ color: '#475569', fontFamily: 'monospace' }}>
            {logs[0].file_key}
          </Typography>
          <Typography variant="caption" sx={{ color: '#334155', mx: 0.5 }}>│</Typography>
          <Typography variant="caption" sx={{ color: '#475569', fontFamily: 'monospace' }}>
            {new Date(logs[0].created_at).toLocaleString()}
          </Typography>
        </Box>
      )}

      {/* ── Log body ───────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 2,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#334155', borderRadius: 2 },
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={24} sx={{ color: '#6366f1' }} />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body2" sx={{ color: '#ef4444', fontFamily: 'monospace' }}>{error}</Typography>
          </Box>
        ) : allLines.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body2" sx={{ color: '#475569', fontFamily: 'monospace' }}>
              No logs found for {environment}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ px: 2 }}>
            {allLines.map((line, idx) => {
              const cfg = getLevelConfig(line.level);
              return (
                <Box
                  key={idx}
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
                  {/* Timestamp */}
                  <Typography sx={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#475569', whiteSpace: 'nowrap' }}>
                    {line.timestamp}
                  </Typography>

                  {/* Level badge */}
                  <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 0.75,
                    py: '1px',
                    borderRadius: '4px',
                    bgcolor: cfg.bg,
                    border: `1px solid ${cfg.color}22`,
                  }}>
                    <Typography sx={{ fontSize: '0.6rem', fontFamily: 'monospace', fontWeight: 700, color: cfg.color, letterSpacing: '0.05em' }}>
                      {cfg.label}
                    </Typography>
                  </Box>

                  {/* Source + Message */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', minWidth: 0 }}>
                    <Typography
                      sx={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#6366f1', whiteSpace: 'nowrap', flexShrink: 0 }}
                      title={line.source}
                    >
                      {line.source.split('.').pop()}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#334155', flexShrink: 0 }}>
                      ›
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#94a3b8', wordBreak: 'break-word' }}>
                      {line.message}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            <div ref={bottomRef} />
          </Box>
        )}
      </Box>
    </Drawer>
  );
};