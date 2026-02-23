'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper, Chip, IconButton } from '@mui/material';
import { motion, AnimatePresence, animate } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { brmsTheme } from '../../../core/theme/brmsTheme';
import { logsApi, HourlyLogEntry, ParsedLogLine } from '../api/logsApi';

const { colors } = brmsTheme;
const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

// ─── Animated counter hook ────────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1.2) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, target, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [target]);
  return display;
}

// ─── Mini sparkline SVG ───────────────────────────────────────────────────────
function Sparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  if (!data || data.length < 2) return null;
  const w = 80;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - (v / max) * height * 0.85;
    return `${x},${y}`;
  });
  const linePath = `M${pts.join(' L')}`;
  const fillPath = `M${pts[0]} L${pts.join(' L')} L${w},${height} L0,${height} Z`;
  const uid = `sg${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${uid})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Live pulse dot ───────────────────────────────────────────────────────────
function PulseDot({ color, active = false }: { color: string; active?: boolean }) {
  return (
    <Box sx={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {active && (
        <Box sx={{
          position: 'absolute', top: 0, left: 0,
          width: 8, height: 8, borderRadius: '50%',
          background: color,
          '@keyframes pulse-out': {
            '0%': { transform: 'scale(1)', opacity: 0.7 },
            '100%': { transform: 'scale(3)', opacity: 0 },
          },
          animation: 'pulse-out 1.8s ease-out infinite',
        }} />
      )}
    </Box>
  );
}

// ─── Enterprise Stat Card ─────────────────────────────────────────────────────
interface LogStatCardProps {
  title: string;
  value: number;
  color: string;
  accent: string;
  icon: React.ReactNode;
  sparkData: number[];
  delta: number;
  badge: string;
  badgeSeverity: 'ok' | 'warn' | 'crit';
  delay?: number;
}

function LogStatCard({ title, value, color, accent, icon, sparkData, delta, badge, badgeSeverity, delay = 0 }: LogStatCardProps) {
  const count = useAnimatedCounter(value);

  const badgePalette = {
    ok:   { bg: '#F0FDF4', border: '#BBF7D0', text: '#16a34a' },
    warn: { bg: '#FFF7ED', border: '#FED7AA', text: '#c2410c' },
    crit: { bg: '#FEF2F2', border: '#FECACA', text: '#b91c1c' },
  }[badgeSeverity];

  const deltaColor = delta === 0 ? colors.textSecondary : delta > 0 ? colors.error : colors.success;
  const deltaLabel = delta === 0 ? '— no change' : delta > 0 ? `+${delta} from prev` : `${delta} from prev`;

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
      elevation={0}
      whileHover={{ y: -3, boxShadow: `0 12px 40px ${color}1A, 0 2px 8px rgba(0,0,0,0.06)` }}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${color}28`,
        background: `linear-gradient(150deg, #ffffff 0%, ${color}07 100%)`,
        overflow: 'hidden',
        cursor: 'default',
        transition: 'box-shadow 0.25s ease',
      }}
    >
      <Box sx={{ height: '3px', background: `linear-gradient(90deg, ${color}, ${accent})` }} />
      <Box sx={{ p: '16px 18px 14px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '14px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box sx={{
              width: 30, height: 30,
              background: `${color}14`,
              border: `1px solid ${color}28`,
              borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {icon}
            </Box>
            <Typography sx={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.textSecondary }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ px: 1.2, py: '3px', borderRadius: '6px', background: badgePalette.bg, border: `1px solid ${badgePalette.border}` }}>
            <Typography sx={{ fontSize: '9.5px', fontWeight: 800, color: badgePalette.text, letterSpacing: '0.06em' }}>
              {badge}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: '12px' }}>
          <Typography sx={{ fontSize: '1.95rem', fontWeight: 800, color: colors.textPrimary, lineHeight: 1, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
            {count.toLocaleString()}
          </Typography>
          <Box sx={{ pb: '2px' }}>
            <Sparkline data={sparkData} color={color} height={28} />
          </Box>
        </Box>

        <Box sx={{ pt: '10px', borderTop: `1px solid ${colors.lightBorder}`, display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: deltaColor, fontVariantNumeric: 'tabular-nums' }}>
            {deltaLabel}
          </Typography>
        </Box>
      </Box>
    </MotionPaper>
  );
}

// ─── Overview panel ───────────────────────────────────────────────────────────
function LogOverviewPanel({ entries, totalInfo, totalWarnings, totalErrors }: {
  entries: HourlyLogEntry[];
  totalInfo: number;
  totalWarnings: number;
  totalErrors: number;
}) {
  const total = totalInfo + totalWarnings + totalErrors;
  const healthColor = totalErrors > 0 ? '#d32f2f' : totalWarnings > 0 ? '#ed6c02' : '#2e7d32';
  const healthLabel = totalErrors > 0 ? 'Degraded' : totalWarnings > 0 ? 'Warning' : 'Healthy';

  const bars = [
    { value: totalInfo,     color: '#1976d2', label: 'Info'  },
    { value: totalWarnings, color: '#ed6c02', label: 'Warn'  },
    { value: totalErrors,   color: '#d32f2f', label: 'Error' },
  ];

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
      elevation={0}
      sx={{ borderRadius: '16px', border: `1px solid ${colors.lightBorder}`, overflow: 'hidden', background: '#fff' }}
    >
      <Box sx={{ background: 'linear-gradient(135deg, #17203D 0%, #2c3e6b 100%)', p: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>
            Log Overview
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>
            {entries.length} hours · {total.toLocaleString()} events
          </Typography>
        </Box>
        <Box sx={{ px: 1.5, py: 0.5, borderRadius: '8px', background: `${healthColor}30`, border: `1px solid ${healthColor}50`, display: 'inline-flex', alignItems: 'center', gap: 0.8 }}>
          <PulseDot color={healthColor} active={healthColor !== '#2e7d32'} />
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: healthColor === '#d32f2f' ? '#fca5a5' : healthColor === '#ed6c02' ? '#fdba74' : '#86efac' }}>
            {healthLabel}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: '14px 18px' }}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', height: 7, borderRadius: 99, overflow: 'hidden', background: colors.lightBorder, gap: '1px' }}>
            {bars.map((b, i) => (
              <MotionBox
                key={i}
                initial={{ width: 0 }}
                animate={{ width: total > 0 ? `${(b.value / total) * 100}%` : 0 }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                sx={{ height: '100%', background: b.color, minWidth: b.value > 0 ? 3 : 0 }}
              />
            ))}
          </Box>
        </Box>
        {bars.map((b, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: '8px', borderBottom: i < bars.length - 1 ? `1px solid ${colors.lightBorder}` : 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '12px', color: colors.textSecondary }}>{b.label}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 700, color: colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
                {b.value.toLocaleString()}
              </Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 600, color: b.color, minWidth: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {total > 0 ? `${Math.round((b.value / total) * 100)}%` : '—'}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </MotionPaper>
  );
}

// ─── Shared RcCard ────────────────────────────────────────────────────────────
function RcCard({ children, delay = 0, sx = {} }: { children: React.ReactNode; delay?: number; sx?: object }) {
  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      elevation={0}
      sx={{ p: 3, borderRadius: '16px', background: '#fff', border: `1px solid ${colors.lightBorder}`, ...sx }}
    >
      {children}
    </MotionPaper>
  );
}

// ─── Hour Badge ───────────────────────────────────────────────────────────────
function HourBadge({ fileKey, active, onClick, errors, warnings }: {
  fileKey: string; active: boolean; onClick: () => void; errors: number; warnings: number;
}) {
  const hour = fileKey.split('-').pop() + ':00';
  const hasError = errors > 0;
  const hasWarn  = warnings > 0 && !hasError;
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Box onClick={onClick} sx={{
        px: 2.5, py: 1.2, borderRadius: '10px', cursor: 'pointer',
        background: active ? brmsTheme.gradients.primary : colors.white,
        border: `1px solid ${active ? 'transparent' : hasError ? colors.errorBorder : hasWarn ? '#FED7AA' : colors.lightBorder}`,
        boxShadow: active ? brmsTheme.shadows.primarySoft : 'none',
        position: 'relative', transition: 'all 0.15s',
      }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: active ? '#fff' : colors.textPrimary, fontFamily: 'monospace' }}>
          {hour}
        </Typography>
        {(hasError || hasWarn) && (
          <Box sx={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: hasError ? colors.error : colors.warning, border: '1.5px solid white' }} />
        )}
      </Box>
    </motion.div>
  );
}

// ─── Log Line ─────────────────────────────────────────────────────────────────
const LEVEL_CONFIG = {
  INFO:    { color: colors.info,    bg: '#EFF6FF', label: 'INFO'  },
  WARNING: { color: colors.warning, bg: '#FFF7ED', label: 'WARN'  },
  ERROR:   { color: colors.error,   bg: '#FEF2F2', label: 'ERROR' },
};

function LogLine({ line }: { line: ParsedLogLine }) {
  const cfg = LEVEL_CONFIG[line.level] ?? LEVEL_CONFIG.INFO;
  return (
    <Box sx={{
      display: 'flex', alignItems: 'flex-start', gap: 1.5,
      px: 2, py: '6px',
      borderBottom: `1px solid ${colors.lightBorder}`,
      '&:hover': { background: colors.lightSurfaceHover },
      transition: 'background 0.1s',
    }}>
      <Box sx={{ flexShrink: 0, mt: '1px', px: 1, py: '1px', borderRadius: 1, background: cfg.bg, minWidth: 46, textAlign: 'center', border: `1px solid ${cfg.color}30` }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: cfg.color, fontFamily: 'monospace' }}>{cfg.label}</Typography>
      </Box>
      <Typography sx={{ flexShrink: 0, fontSize: 11, color: colors.textSecondary, fontFamily: 'monospace', mt: '2px', minWidth: 70 }}>
        {line.timestamp.split(' ')[1]}
      </Typography>
      <Typography sx={{ flexShrink: 0, fontSize: 11, color: colors.primary, fontFamily: 'monospace', mt: '2px', minWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {line.source.split('.').slice(-2).join('.')}
      </Typography>
      <Typography sx={{ fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-word', color: line.level === 'ERROR' ? colors.error : line.level === 'WARNING' ? colors.warning : colors.textPrimary }}>
        {line.message}
      </Typography>
    </Box>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const InfoSvg  = ({ c }: { c: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2.2"/>
    <path d="M12 8v1M12 11v5" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);
const WarnSvg  = ({ c }: { c: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 3L22 20H2L12 3z" stroke={c} strokeWidth="2.2" strokeLinejoin="round"/>
    <path d="M12 10v4M12 17v.5" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);
const ErrorSvg = ({ c }: { c: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2.2"/>
    <path d="M9 9l6 6M15 9l-6 6" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LogsPage() {
  const navigate = useNavigate();

  const [entries,  setEntries]  = useState<HourlyLogEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [filter,   setFilter]   = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR'>('ALL');

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const data = await logsApi.getHourlyLogs();
        setEntries(data);
        if (data.length > 0) setSelected(data[0].file_key);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load logs');
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const activeEntry   = entries.find(e => e.file_key === selected);
  const filteredLines = (activeEntry?.lines ?? []).filter(l => filter === 'ALL' || l.level === filter);

  const totalInfo     = entries.reduce((s, e) => s + e.info, 0);
  const totalWarnings = entries.reduce((s, e) => s + e.warnings, 0);
  const totalErrors   = entries.reduce((s, e) => s + e.errors, 0);

  const infoSpark  = entries.map(e => e.info);
  const warnSpark  = entries.map(e => e.warnings);
  const errorSpark = entries.map(e => e.errors);
  const delta = (arr: number[]) => arr.length >= 2 ? arr[arr.length - 1] - arr[arr.length - 2] : 0;

  if (loading) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <CircularProgress sx={{ color: colors.primary }} />
    </Box>
  );
  if (error) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Typography sx={{ color: colors.error }}>{error}</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: '28px 32px', background: colors.surfaceBase, minHeight: '100vh' }}>

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <MotionBox
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        {/* Left: back button + title stack */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Back button — matches HubPage / DashboardPage pattern exactly */}
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: colors.primaryGlowSoft,
              color: colors.primary,
              flexShrink: 0,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: colors.primaryGlowMid,
                transform: 'translateX(-2px)',
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: colors.textPrimary, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              System Logs
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.3 }}>
              {entries.length} hours recorded today · real-time monitoring
            </Typography>
          </Box>
        </Box>

        {/* Right: live indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PulseDot color="#2e7d32" active />
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#2e7d32' }}>Live</Typography>
        </Box>
      </MotionBox>

      {/* ── Stats row ────────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2.5, mb: 3 }}>
        <LogOverviewPanel entries={entries} totalInfo={totalInfo} totalWarnings={totalWarnings} totalErrors={totalErrors} />

        <LogStatCard title="Info Events" value={totalInfo} color="#1976d2" accent="#42a5f5" icon={<InfoSvg c="#1976d2" />} sparkData={infoSpark} delta={delta(infoSpark)} badge="NOMINAL" badgeSeverity="ok" delay={0.08} />
        <LogStatCard title="Warnings" value={totalWarnings} color="#ed6c02" accent="#ffb74d" icon={<WarnSvg c="#ed6c02" />} sparkData={warnSpark} delta={delta(warnSpark)} badge={totalWarnings > 0 ? 'REVIEW' : 'CLEAR'} badgeSeverity={totalWarnings > 0 ? 'warn' : 'ok'} delay={0.16} />
        <LogStatCard title="Errors" value={totalErrors} color="#d32f2f" accent="#ef9a9a" icon={<ErrorSvg c="#d32f2f" />} sparkData={errorSpark} delta={delta(errorSpark)} badge={totalErrors > 0 ? 'ACTION REQ.' : 'CLEAR'} badgeSeverity={totalErrors > 0 ? 'crit' : 'ok'} delay={0.24} />
      </Box>

      {/* ── Hour selector ─────────────────────────────────────────────────────── */}
      <RcCard delay={0.2} sx={{ mb: 3, p: '14px 20px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: colors.textSecondary }}>
            Hour Selector
          </Typography>
          <Typography sx={{ fontSize: '11px', color: colors.textSecondary }}>
            {selected?.split('-').pop()}:00 active
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {entries.map(e => (
            <HourBadge
              key={e.file_key}
              fileKey={e.file_key}
              active={selected === e.file_key}
              errors={e.errors}
              warnings={e.warnings}
              onClick={() => { setSelected(e.file_key); setFilter('ALL'); }}
            />
          ))}
        </Box>
      </RcCard>

      {/* ── Log viewer ───────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeEntry && (
          <MotionPaper
            key={activeEntry.file_key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            elevation={0}
            sx={{ borderRadius: '16px', border: `1px solid ${colors.lightBorder}`, overflow: 'hidden', background: '#fff' }}
          >
            <Box sx={{
              px: 3, py: '11px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: `1px solid ${colors.lightBorder}`,
              background: colors.surfaceBase,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: colors.textPrimary, fontFamily: 'monospace' }}>
                  {activeEntry.file_key}
                </Typography>
                {[
                  { value: activeEntry.info,     color: colors.info,    label: 'info'  },
                  { value: activeEntry.warnings, color: colors.warning, label: 'warn'  },
                  { value: activeEntry.errors,   color: colors.error,   label: 'error' },
                ].map(({ value, color, label }) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6, px: 1.2, py: '3px', borderRadius: '6px', background: `${color}10`, border: `1px solid ${color}25` }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
                    <Typography sx={{ fontSize: 11, color: colors.textSecondary }}>{label}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.8 }}>
                {(['ALL', 'INFO', 'WARNING', 'ERROR'] as const).map(f => (
                  <motion.div key={f} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Chip
                      label={f}
                      size="small"
                      onClick={() => setFilter(f)}
                      sx={{
                        fontWeight: 700, fontSize: 10, cursor: 'pointer', height: 24,
                        background: filter === f ? brmsTheme.gradients.primary : 'transparent',
                        color: filter === f ? '#fff' : colors.textSecondary,
                        border: `1px solid ${filter === f ? 'transparent' : colors.lightBorder}`,
                        boxShadow: filter === f ? brmsTheme.shadows.primarySoft : 'none',
                        letterSpacing: '0.04em',
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </Box>

            <Box sx={{
              maxHeight: 480, overflowY: 'auto',
              '&::-webkit-scrollbar': { width: 5 },
              '&::-webkit-scrollbar-thumb': { background: colors.primary + '40', borderRadius: 3 },
            }}>
              {filteredLines.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography sx={{ color: colors.textSecondary, fontSize: 13 }}>
                    No {filter !== 'ALL' ? filter.toLowerCase() : ''} events in this window
                  </Typography>
                </Box>
              ) : filteredLines.map((line, i) => <LogLine key={i} line={line} />)}
            </Box>

            <Box sx={{
              px: 3, py: 1.5, borderTop: `1px solid ${colors.lightBorder}`,
              background: colors.surfaceBase,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <Typography sx={{ fontSize: 11, color: colors.textSecondary, fontFamily: 'monospace' }}>
                {filteredLines.length} / {activeEntry.total} lines{filter !== 'ALL' && ` · ${filter}`}
              </Typography>
              <Typography sx={{ fontSize: 11, color: colors.textSecondary, fontFamily: 'monospace' }}>
                {new Date(activeEntry.created_at).toLocaleString()}
              </Typography>
            </Box>
          </MotionPaper>
        )}
      </AnimatePresence>
    </Box>
  );
}