'use client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { verticalsApi, VerticalView } from '../api/verticalsApi';

/* ─── Design Tokens (matches CreateProjectPage) ───────────── */
const T = {
  bgRoot:      '#0A0C10',
  bgLeft:      '#0A0C10',
  bgRight:     '#F7F8FA',
  indigo:      '#4F46E5',
  indigoHover: '#4338CA',
  indigoMuted: 'rgba(79,70,229,0.08)',
  indigoGlow:  'rgba(79,70,229,0.20)',
  dTextHigh:   '#FFFFFF',
  dTextMid:    'rgba(255,255,255,0.45)',
  dTextLow:    'rgba(255,255,255,0.18)',
  dBorder:     'rgba(255,255,255,0.06)',
  lTextHigh:   '#0F172A',
  lTextMid:    '#475569',
  lTextLow:    '#94A3B8',
  lBorder:     '#E2E8F0',
  font:        '"DM Sans", "Inter", sans-serif',
  mono:        '"DM Mono", "Fira Code", monospace',
};

/* ─── Feature item (left panel) ──────────────────────────── */
const Feature = ({ children, last }: { children: string; last?: boolean }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: '12px', py: '12px',
    borderBottom: last ? 'none' : `1px solid ${T.dBorder}`,
  }}>
    <Box sx={{ width: '4px', height: '4px', borderRadius: '50%', bgcolor: T.indigo, flexShrink: 0 }} />
    <Typography sx={{ fontSize: '0.8rem', color: T.dTextMid, fontWeight: 400, lineHeight: 1, letterSpacing: '0.01em', fontFamily: T.font }}>
      {children}
    </Typography>
  </Box>
);

/* ─── Page ────────────────────────────────────────────────── */
export default function VerticalSelectionComponent() {
  const navigate = useNavigate();
  const [verticals, setVerticals] = useState<VerticalView[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  useEffect(() => {
    verticalsApi
      .getVerticalsView()
      .then((data) => setVerticals(data))
      .catch((error) => console.error('Error fetching verticals:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleCardClick = (item: VerticalView) => {
    navigate(`/vertical/${item.vertical_key}/dashboard`, { state: { verticalName: item.vertical_name } });
  };

  return (
    <Box sx={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      overflow: 'hidden',
      background: T.bgRoot,
      fontFamily: T.font,
    }}>

      {/* ══════════════════════════════════════════
          LEFT PANEL
      ══════════════════════════════════════════ */}
      <Box sx={{
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        width: '42%',
        flexShrink: 0,
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: T.bgLeft,
        borderRight: `1px solid ${T.dBorder}`,
      }}>
        {/* Glow */}
        <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.14) 0%, transparent 60%)', pointerEvents: 'none' }} />
        {/* Dot grid */}
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.09, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', px: '48px', py: '40px' }}>

          {/* Logo / wordmark */}
          <Box sx={{ flexShrink: 0, mb: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayersIcon sx={{ fontSize: 16, color: '#818CF8' }} />
            </Box>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: T.dTextMid, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: T.mono }}>
              BRMS Platform
            </Typography>
          </Box>

          {/* Hero copy */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {/* Badge */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px', mb: '24px' }}>
              <Box sx={{ width: '6px', height: '6px', borderRadius: '50%', bgcolor: T.indigo, boxShadow: `0 0 8px ${T.indigoGlow}` }} />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: T.dTextLow, letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: T.mono }}>
                Select · Vertical
              </Typography>
            </Box>

            {/* Headline */}
            <Typography sx={{ fontSize: 'clamp(2rem, 2.6vw, 2.75rem)', fontWeight: 800, color: T.dTextHigh, lineHeight: 1.05, letterSpacing: '-0.04em', mb: '20px', whiteSpace: 'pre-line' }}>
              {'Choose your\nvertical.'}
            </Typography>

            {/* Sub-copy */}
            <Typography sx={{ fontSize: '0.8125rem', color: T.dTextMid, lineHeight: 1.8, mb: '40px', maxWidth: '300px', fontWeight: 400, fontFamily: T.font }}>
              Each vertical is an isolated decision domain. Select one to manage its projects, rules, and deployment pipelines.
            </Typography>

            {/* Feature list */}
            <Box>
              {[
                'Isolated rule sets per business domain',
                'Independent versioning & deployment',
                'Role-based access per vertical',
              ].map((label, i) => (
                <Feature key={label} last={i === 2}>{label}</Feature>
              ))}
            </Box>

            {/* Live count */}
            {!loading && verticals.length > 0 && (
              <Box sx={{ mt: '40px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <Box sx={{ height: '1px', width: '24px', bgcolor: T.dBorder }} />
                <Typography sx={{ fontSize: '0.6875rem', color: T.dTextLow, fontFamily: T.mono, letterSpacing: '0.08em' }}>
                  {verticals.length} {verticals.length === 1 ? 'vertical' : 'verticals'} available
                </Typography>
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Typography sx={{ fontSize: '0.625rem', color: T.dTextLow, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: T.mono, flexShrink: 0, mt: '32px' }}>
            BRMS Platform · 2025
          </Typography>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════
          RIGHT PANEL
      ══════════════════════════════════════════ */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'auto',
        background: T.bgRight,
        px: { xs: '24px', sm: '48px', lg: '56px' },
        py: '48px',
      }}>

        {/* Accent bar + heading */}
        <Box sx={{ mb: '32px', flexShrink: 0 }}>
          <Box sx={{ width: '32px', height: '2px', borderRadius: '1px', background: T.indigo, mb: '24px', opacity: 0.9 }} />
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: T.lTextHigh, letterSpacing: '-0.03em', lineHeight: 1.1, mb: '8px', fontFamily: T.font }}>
            Select a vertical
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: T.lTextMid, fontWeight: 400, lineHeight: 1.65, fontFamily: T.font }}>
            Choose the business domain you want to work in.
          </Typography>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={24} sx={{ color: T.indigo }} />
          </Box>
        ) : verticals.length === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: '0.875rem', color: T.lTextLow, fontFamily: T.mono }}>
              No verticals found.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {verticals.map((item) => {
              const isHovered = hoveredKey === item.vertical_key;
              return (
                <Box
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  onMouseEnter={() => setHoveredKey(item.vertical_key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  sx={{
                    borderRadius: '10px',
                    border: `1px solid ${isHovered ? T.indigo : T.lBorder}`,
                    background: isHovered ? T.indigoMuted : '#FFFFFF',
                    px: '20px',
                    py: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transform: isHovered ? 'translateY(-1px)' : 'none',
                    boxShadow: isHovered ? `0 4px 16px ${T.indigoGlow}` : '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <Box>
                    <Typography sx={{
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      color: isHovered ? T.indigo : T.lTextHigh,
                      letterSpacing: '-0.01em',
                      fontFamily: T.font,
                      transition: 'color 0.15s',
                      mb: '2px',
                    }}>
                      {item.vertical_name}
                    </Typography>
                    <Typography sx={{
                      fontSize: '0.6875rem',
                      color: T.lTextLow,
                      fontFamily: T.mono,
                      letterSpacing: '0.04em',
                    }}>
                      {item.vertical_key}
                    </Typography>
                  </Box>

                  <Box sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    background: isHovered ? T.indigo : '#F1F5F9',
                    border: `1px solid ${isHovered ? T.indigo : T.lBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}>
                    <ArrowForwardIcon sx={{ fontSize: 14, color: isHovered ? '#ffffff' : T.lTextLow, transition: 'color 0.15s' }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}