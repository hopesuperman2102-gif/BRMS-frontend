'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Typography, CircularProgress, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';
import { brmsTheme } from '../../../core/theme/brmsTheme';
import { logsApi, HourlyLogEntry, ParsedLogLine } from '../api/logsApi';
import RcDropdown from '../../../core/components/RcDropdown';

const { colors, fonts, gradients, shadows } = brmsTheme;
const MotionBox = motion(Box);

// ─── helpers ──────────────────────────────────────────────────────────────────
function extractDate(fileKey: string): string {
  return fileKey.split('-').slice(0, -1).join('-');
}
function formatDateLabel(dateKey: string): string {
  const match = dateKey.match(/(\d{4}-\d{2}-\d{2})$/);
  if (match) return new Date(match[1]).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  return dateKey;
}
function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── per-page level counts ────────────────────────────────────────────────────
function countByLevel(lines: ParsedLogLine[]) {
  return lines.reduce(
    (acc, l) => {
      if      (l.level === 'INFO')    acc.info++;
      else if (l.level === 'WARNING') acc.warn++;
      else if (l.level === 'ERROR')   acc.error++;
      return acc;
    },
    { info: 0, warn: 0, error: 0 },
  );
}

// ─── level config — 100% brmsTheme tokens ────────────────────────────────────
const LEVEL_CFG = {
  INFO: {
    color:  colors.info,
    bg:     colors.statusDefaultBg,
    border: colors.statusDefaultBorder,
    label:  'INFO',
  },
  WARNING: {
    color:  colors.warning,
    bg:     colors.statusInactiveBg,
    border: colors.statusInactiveBorder,
    label:  'WARN',
  },
  ERROR: {
    color:  colors.error,
    bg:     colors.errorBg,
    border: colors.errorBorder,
    label:  'ERR',
  },
} as const;

// ─── Panel ────────────────────────────────────────────────────────────────────
function Panel({ children, delay = 0, sx = {} }: {
  children: React.ReactNode; delay?: number; sx?: object;
}) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
      sx={{
        background: colors.white,
        border: `1px solid ${colors.lightBorder}`,
        borderRadius: '10px',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {children}
    </MotionBox>
  );
}

function PanelHeader({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <Box sx={{
      px: 2, py: '9px',
      borderBottom: `1px solid ${colors.lightBorder}`,
      background: colors.surfaceBase,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Typography sx={{
        fontSize: '10px', fontWeight: 700,
        color: colors.lightTextMid,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        fontFamily: fonts.mono,
      }}>
        {children}
      </Typography>
      {right}
    </Box>
  );
}

// ─── per-page breakdown badges ────────────────────────────────────────────────
function PageBreakdown({ lines }: { lines: ParsedLogLine[] }) {
  const { info, warn, error } = countByLevel(lines);
  const items = [
    { count: info,  ...LEVEL_CFG.INFO    },
    { count: warn,  ...LEVEL_CFG.WARNING },
    { count: error, ...LEVEL_CFG.ERROR   },
  ];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <Typography sx={{ fontSize: 10, color: colors.lightTextLow, fontFamily: fonts.mono, mr: 0.5 }}>
        this page:
      </Typography>
      {items.map(({ count, label, color, bg, border }) => (
        <Box
          key={label}
          sx={{
            display: 'flex', alignItems: 'center', gap: '4px',
            px: '7px', py: '3px', borderRadius: '5px',
            background: bg, border: `1px solid ${border}`,
          }}
        >
          <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 10, fontWeight: 800, color, fontFamily: fonts.mono, fontVariantNumeric: 'tabular-nums' }}>
            {count}
          </Typography>
          <Typography sx={{ fontSize: 10, color, fontFamily: fonts.mono, opacity: 0.8 }}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// ─── Volume bar chart ─────────────────────────────────────────────────────────
function VolumeChart({ entries, selected }: { entries: HourlyLogEntry[]; selected: string | null }) {
  const max = Math.max(...entries.map(e => e.total), 1);
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 52 }}>
      {entries.map((e, i) => {
        const pct      = (e.total / max) * 100;
        const isActive = e.file_key === selected;
        return (
          <Box
            key={i}
            title={`${e.file_key.split('-').pop()}:00`}
            sx={{
              flex: 1, borderRadius: '2px 2px 0 0',
              height: `${Math.max(pct, 5)}%`,
              background: isActive ? colors.primary : colors.panelIndigoMuted,
              transition: 'all 0.2s', cursor: 'default',
              '&:hover': { background: colors.panelIndigoTint15 },
            }}
          />
        );
      })}
    </Box>
  );
}

// ─── Hour badge ───────────────────────────────────────────────────────────────
function HourBadge({ fileKey, createdAt, active, onClick }: {
  fileKey: string; createdAt: string; active: boolean; onClick: () => void;
}) {
  const hour = fileKey.split('-').pop() + ':00';
  const time = createdAt
    ? new Date(createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : null;
  return (
    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
      <Box
        onClick={onClick}
        sx={{
          px: '12px', py: '9px', borderRadius: '8px', cursor: 'pointer',
          background: active ? gradients.primary : colors.white,
          border: `1px solid ${active ? colors.primary : colors.lightBorder}`,
          boxShadow: active ? shadows.primarySoft : 'none',
          transition: 'all 0.15s', textAlign: 'center', minWidth: 60,
          '&:hover': !active ? { borderColor: colors.lightBorderHover, background: colors.lightSurfaceHover } : {},
        }}
      >
        <Typography sx={{
          fontSize: 13, fontWeight: 700, lineHeight: 1,
          color: active ? colors.textOnPrimary : colors.lightTextHigh,
          fontFamily: fonts.mono,
        }}>
          {hour}
        </Typography>
        {time && (
          <Typography sx={{
            fontSize: 9, mt: '3px',
            color: active ? colors.panelTextMid : colors.lightTextLow,
            fontFamily: fonts.mono,
          }}>
            {time}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
}

// ─── Log line row ─────────────────────────────────────────────────────────────
function LogLine({ line, index }: { line: ParsedLogLine; index: number }) {
  const cfg = LEVEL_CFG[line.level as keyof typeof LEVEL_CFG] ?? LEVEL_CFG.INFO;
  return (
    <Box sx={{
      display: 'grid', gridTemplateColumns: '44px 72px 160px 1fr',
      alignItems: 'center', px: 2, py: '5px',
      borderBottom: `1px solid ${colors.lightBorder}`,
      background: index % 2 === 0 ? colors.white : colors.surfaceBase,
      '&:hover': { background: colors.primaryGlowSoft },
      transition: 'background 0.1s',
    }}>
      <Box sx={{
        px: '5px', py: '1px', borderRadius: '3px',
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        display: 'inline-flex', justifyContent: 'center', width: 'fit-content',
      }}>
        <Typography sx={{ fontSize: 9, fontWeight: 800, color: cfg.color, letterSpacing: '0.05em', fontFamily: fonts.mono }}>
          {cfg.label}
        </Typography>
      </Box>

      <Typography sx={{ fontSize: 11, color: colors.lightTextLow, fontFamily: fonts.mono, pl: '6px' }}>
        {line.timestamp.split(' ')[1]}
      </Typography>

      <Typography sx={{
        fontSize: 11, fontFamily: fonts.mono, px: '6px',
        color: colors.panelIndigo,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {line.source.split('.').slice(-2).join('.')}
      </Typography>

      <Typography sx={{
        fontSize: 12, fontFamily: fonts.mono, lineHeight: 1.4, wordBreak: 'break-all',
        color: line.level === 'ERROR'
          ? colors.error
          : line.level === 'WARNING'
          ? colors.warning
          : colors.lightTextHigh,
      }}>
        {line.message}
      </Typography>
    </Box>
  );
}

// ─── Pagination arrow ─────────────────────────────────────────────────────────
function PageArrow({ direction, enabled, onClick }: {
  direction: 'prev' | 'next'; enabled: boolean; onClick: () => void;
}) {
  return (
    <motion.div whileHover={{ scale: enabled ? 1.08 : 1 }} whileTap={{ scale: enabled ? 0.92 : 1 }}>
      <Box
        onClick={() => enabled && onClick()}
        sx={{
          width: 28, height: 28, borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: enabled ? 'pointer' : 'default',
          background: enabled ? colors.primaryGlowSoft : 'transparent',
          border: `1px solid ${enabled ? colors.primaryGlowMid : colors.lightBorder}`,
          opacity: enabled ? 1 : 0.4,
          transition: 'all 0.15s',
          '&:hover': enabled ? { background: colors.primaryGlowMid } : {},
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d={direction === 'prev' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
            stroke={enabled ? colors.primary : colors.lightTextLow}
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </Box>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LogsPage() {
  const navigate = useNavigate();

  const [entries,     setEntries]     = useState<HourlyLogEntry[]>([]);
  const [selected,    setSelected]    = useState<string | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const [visibleLines, setVisibleLines] = useState<ParsedLogLine[]>([]);
  const [currentPage,  setCurrentPage]  = useState(0);
  const [pageTotal,    setPageTotal]    = useState(0);
  const [linesLoading, setLinesLoading] = useState(false);

  const PAGE_SIZE = logsApi.PAGE_SIZE;

  const fetchPage = useCallback(async (fileKey: string, page: number) => {
    setLinesLoading(true);
    try {
      const { lines, total } = await logsApi.getHourlyLogPage(fileKey, page * PAGE_SIZE);
      setVisibleLines(lines); setCurrentPage(page); setPageTotal(total);
    } catch { /* keep */ } finally { setLinesLoading(false); }
  }, [PAGE_SIZE]);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const data = await logsApi.getHourlyLogs();
        setEntries(data);
        if (data.length > 0) {
          const firstDay = extractDate(data[0].file_key);
          setSelectedDay(firstDay);
          setSelected(data[0].file_key);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load logs');
      } finally { setLoading(false); }
    }
    init();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setVisibleLines([]); setCurrentPage(0); setPageTotal(0);
    fetchPage(selected, 0);
  }, [selected, fetchPage]);

  // ── derived ──────────────────────────────────────────────────────────────────
  const uniqueDays = useMemo(() => {
    const seen = new Set<string>(); const days: string[] = [];
    for (const e of entries) {
      const d = extractDate(e.file_key);
      if (!seen.has(d)) { seen.add(d); days.push(d); }
    }
    return days;
  }, [entries]);

  const dayDropdownItems = useMemo(() =>
    uniqueDays.map(d => ({ value: d, label: formatDateLabel(d) })),
    [uniqueDays]);

  const dayEntries = useMemo(() =>
    selectedDay ? entries.filter(e => extractDate(e.file_key) === selectedDay) : entries,
    [entries, selectedDay]);

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    const first = entries.find(e => extractDate(e.file_key) === day);
    if (first) setSelected(first.file_key);
  };

  const activeEntry  = entries.find(e => e.file_key === selected);
  const totalPages   = Math.ceil(pageTotal / PAGE_SIZE);
  const hasPrev      = currentPage > 0;
  const hasNext      = currentPage < totalPages - 1;
  const chartEntries = dayEntries.length > 0 ? dayEntries : entries;

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
      <CircularProgress sx={{ color: colors.primary }} size={26} />
      <Typography sx={{ color: colors.lightTextLow, fontFamily: fonts.mono, fontSize: 12 }}>
        Loading log index…
      </Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Typography sx={{ color: colors.error, fontFamily: fonts.mono }}>{error}</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: '24px 28px', background: colors.surfaceBase, minHeight: '100vh' }}>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <MotionBox
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
        sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              width: 34, height: 34, borderRadius: '8px',
              background: colors.white,
              border: `1px solid ${colors.lightBorder}`,
              color: colors.lightTextMid,
              transition: 'all 0.15s',
              '&:hover': {
                background: colors.primaryGlowSoft,
                color: colors.primary,
                borderColor: colors.primaryGlowMid,
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Typography sx={{ fontSize: 12, color: colors.lightTextLow, fontFamily: fonts.mono }}>
              monitoring
            </Typography>
            <Typography sx={{ fontSize: 12, color: colors.lightTextLow, fontFamily: fonts.sans }}>/</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: colors.lightTextHigh, fontFamily: fonts.mono }}>
              system-logs
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex', alignItems: 'center', gap: '6px',
            px: 1.2, py: '4px', borderRadius: '6px',
            background: colors.approvedBg,
            border: `1px solid ${colors.approvedBorder}`,
          }}>
            <Box sx={{
              width: 6, height: 6, borderRadius: '50%',
              background: colors.approvedText,
              '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
              animation: 'blink 2s ease-in-out infinite',
            }} />
            <Typography sx={{
              fontSize: '10px', fontWeight: 700,
              color: colors.approvedText,
              letterSpacing: '0.07em',
              fontFamily: fonts.mono,
            }}>
              LIVE
            </Typography>
          </Box>
        </Box>

        {dayDropdownItems.length > 0 && (
          <RcDropdown
            label="Select Day"
            items={dayDropdownItems}
            value={selectedDay ?? undefined}
            onSelect={handleDaySelect}
            startIcon={<CalendarTodayIcon sx={{ fontSize: 15, color: colors.primary }} />}
          />
        )}
      </MotionBox>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Hour timeline */}
        <Panel delay={0.05}>
          <PanelHeader right={
            selectedDay
              ? <Typography sx={{ fontSize: 10, color: colors.lightTextLow, fontFamily: fonts.mono }}>
                  {formatDateLabel(selectedDay)}
                </Typography>
              : null
          }>
            Hour Timeline
          </PanelHeader>

          <Box sx={{ px: 2, pt: 2, pb: 0 }}>
            <VolumeChart entries={chartEntries} selected={selected} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '4px', mb: 1 }}>
              <Typography sx={{ fontSize: 9, color: colors.lightTextLow, fontFamily: fonts.mono }}>
                {chartEntries[0]?.file_key.split('-').pop()}:00
              </Typography>
              <Typography sx={{ fontSize: 9, color: colors.lightTextLow, fontFamily: fonts.mono }}>
                {chartEntries.slice(-1)[0]?.file_key.split('-').pop()}:00
              </Typography>
            </Box>
          </Box>

          <Box sx={{ px: 2, pb: 2, pt: 1.5, borderTop: `1px solid ${colors.lightBorder}` }}>
            <AnimatePresence mode="wait">
              <MotionBox
                key={selectedDay ?? 'all'}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}
              >
                {dayEntries.length === 0
                  ? <Typography sx={{ fontSize: 12, color: colors.lightTextLow, fontFamily: fonts.mono }}>No hours found.</Typography>
                  : dayEntries.map(e => (
                      <HourBadge
                        key={e.file_key}
                        fileKey={e.file_key}
                        createdAt={e.created_at}
                        active={selected === e.file_key}
                        onClick={() => setSelected(e.file_key)}
                      />
                    ))
                }
              </MotionBox>
            </AnimatePresence>
          </Box>
        </Panel>

        {/* Log viewer */}
        <AnimatePresence mode="wait">
          {activeEntry && (
            <MotionBox
              key={activeEntry.file_key}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              sx={{ background: colors.white, border: `1px solid ${colors.lightBorder}`, borderRadius: '10px', overflow: 'hidden' }}
            >
              <Box sx={{
                px: 2, py: '10px',
                background: colors.surfaceBase,
                borderBottom: `1px solid ${colors.lightBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 1,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    px: 1, py: '3px', borderRadius: '5px',
                    background: colors.primaryGlowSoft,
                    border: `1px solid ${colors.primaryGlowMid}`,
                  }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: colors.primary, fontFamily: fonts.mono }}>
                      {activeEntry.file_key}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 10, color: colors.lightTextLow, fontFamily: fonts.mono }}>
                    page {currentPage + 1} of {totalPages}
                  </Typography>
                  {activeEntry.created_at && (
                    <Typography sx={{ fontSize: 10, color: colors.lightTextLow, fontFamily: fonts.mono }}>
                      · {formatCreatedAt(activeEntry.created_at)}
                    </Typography>
                  )}
                </Box>

                {!linesLoading && visibleLines.length > 0 && (
                  <PageBreakdown lines={visibleLines} />
                )}
              </Box>

              <Box sx={{
                display: 'grid', gridTemplateColumns: '44px 72px 160px 1fr',
                px: 2, py: '5px',
                background: colors.bgGrayLight,
                borderBottom: `1px solid ${colors.lightBorder}`,
              }}>
                {['LEVEL', 'TIME', 'SOURCE', 'MESSAGE'].map((h, i) => (
                  <Typography key={h} sx={{
                    fontSize: 9, fontWeight: 800,
                    color: colors.lightTextLow,
                    letterSpacing: '0.1em', fontFamily: fonts.mono,
                    pl: i > 0 ? '6px' : 0,
                  }}>
                    {h}
                  </Typography>
                ))}
              </Box>

              <AnimatePresence mode="wait">
                <MotionBox
                  key={`${activeEntry.file_key}-p${currentPage}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {linesLoading ? (
                    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={20} sx={{ color: colors.primary }} />
                      <Typography sx={{ fontSize: 11, color: colors.lightTextLow, fontFamily: fonts.mono }}>
                        Fetching page {currentPage + 1}…
                      </Typography>
                    </Box>
                  ) : visibleLines.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <Typography sx={{ color: colors.lightTextLow, fontSize: 12, fontFamily: fonts.mono }}>
                        — no events on this page —
                      </Typography>
                    </Box>
                  ) : visibleLines.map((line, i) => (
                    <LogLine key={i} line={line} index={i} />
                  ))}
                </MotionBox>
              </AnimatePresence>

              <Box sx={{
                px: 2, py: '8px',
                borderTop: `1px solid ${colors.lightBorder}`,
                background: colors.surfaceBase,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <Typography sx={{ fontSize: 11, color: colors.lightTextLow, fontFamily: fonts.mono, minWidth: 160 }}>
                  {linesLoading
                    ? 'loading…'
                    : `rows ${currentPage * PAGE_SIZE + 1}–${Math.min((currentPage + 1) * PAGE_SIZE, pageTotal)} of ${pageTotal}`}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <PageArrow direction="prev" enabled={hasPrev && !linesLoading} onClick={() => fetchPage(selected!, currentPage - 1)} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {Array.from({ length: totalPages }, (_, i) => {
                      const isActive      = i === currentPage;
                      const nearCurrent   = Math.abs(i - currentPage) <= 1;
                      const isEdge        = i === 0 || i === totalPages - 1;
                      const showEllBefore = i === currentPage - 2 && currentPage > 2;
                      const showEllAfter  = i === currentPage + 2 && currentPage < totalPages - 3;

                      if (showEllBefore || showEllAfter) return (
                        <Typography key={i} sx={{ fontSize: 11, color: colors.lightTextLow, px: '2px', userSelect: 'none', fontFamily: fonts.mono }}>
                          …
                        </Typography>
                      );
                      if (!isEdge && !nearCurrent) return null;

                      return (
                        <motion.div key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Box
                            onClick={() => !linesLoading && fetchPage(selected!, i)}
                            sx={{
                              minWidth: 26, height: 26, borderRadius: '5px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: linesLoading ? 'default' : 'pointer',
                              background: isActive ? gradients.primary : 'transparent',
                              border: `1px solid ${isActive ? colors.primary : colors.lightBorder}`,
                              boxShadow: isActive ? shadows.primarySoft : 'none',
                              transition: 'all 0.12s',
                              '&:hover': !isActive ? { background: colors.primaryGlowSoft } : {},
                            }}
                          >
                            <Typography sx={{
                              fontSize: 11,
                              fontWeight: isActive ? 800 : 500,
                              color: isActive ? colors.textOnPrimary : colors.lightTextMid,
                              fontFamily: fonts.mono,
                              userSelect: 'none',
                            }}>
                              {i + 1}
                            </Typography>
                          </Box>
                        </motion.div>
                      );
                    })}
                  </Box>

                  <PageArrow direction="next" enabled={hasNext && !linesLoading} onClick={() => fetchPage(selected!, currentPage + 1)} />
                </Box>

                <Typography sx={{ fontSize: 10, color: colors.lightTextLow, fontFamily: fonts.mono, textAlign: 'right', minWidth: 160 }}>
                  {pageTotal} total lines
                </Typography>
              </Box>
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}