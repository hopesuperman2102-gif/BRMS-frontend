'use client';

import { Box, Typography } from '@mui/material';
import AccountTree from '@mui/icons-material/AccountTree';
import { FolderNode, FileNode } from '../types/Explorertypes';

const T = {
  bgLeft:    '#0A0C10',
  indigo:    '#4F46E5',
  dTextHigh: '#FFFFFF',
  dTextMid:  'rgba(255,255,255,0.45)',
  dTextLow:  'rgba(255,255,255,0.18)',
  dBorder:   'rgba(255,255,255,0.06)',
};

const STATUS_DOT: Record<string, string> = {
  using:      '#22C55E',
  active:     '#22C55E',
  draft:      '#A8A29E',
  inactive:   '#FB923C',
  deprecated: '#EF4444',
};

interface RulesLeftPanelProps {
  projectName: string;
  verticalName: string;
  folders: FolderNode[];
  files: FileNode[];
  currentPath: string;
  hoveredRule: FileNode | null;
}

export function RulesLeftPanel({
  folders,
  files,
  hoveredRule,
}: RulesLeftPanelProps) {
  const totalRules   = files.length;
  const totalFolders = folders.filter((f) => !f.isTemp).length;

  const statusCounts = files.reduce<Record<string, number>>((acc, f) => {
    const s = (f.status ?? 'draft').toLowerCase();
    if (s === 'deleted') return acc;
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Box sx={{
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      width: '38%',
      flexShrink: 0,
      background: T.bgLeft,
      borderRight: `1px solid ${T.dBorder}`,
      position: 'relative',
      overflow: 'hidden',
      px: '36px',
      py: '32px',
    }}>
      {/* Glow */}
      <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.16) 0%, transparent 60%)', pointerEvents: 'none' }} />
      {/* Dot grid */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.08, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Icon + title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: '8px' }}>
          <Box sx={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AccountTree sx={{ fontSize: 18, color: '#818CF8' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: T.dTextHigh, letterSpacing: '-0.025em', lineHeight: 1 }}>
              Rules
            </Typography>

          </Box>
        </Box>

        <Typography sx={{ fontSize: '0.8125rem', color: T.dTextMid, lineHeight: 1.75, mb: '24px', fontWeight: 400 }}>
          Manage your decision rules, folders, and versions for this project.
        </Typography>

        {/* Quick count cards */}
        <Box sx={{ display: 'flex', gap: '12px', mb: '28px' }}>
          {[['Rules', String(totalRules)], ['Folders', String(totalFolders)]].map(([label, val]) => (
            <Box key={label} sx={{ flex: 1, borderRadius: '8px', border: `1px solid ${T.dBorder}`, px: '12px', py: '10px', background: 'rgba(255,255,255,0.03)' }}>
              <Typography sx={{ fontSize: '1.375rem', fontWeight: 800, color: T.dTextHigh, fontFamily: '"DM Mono", monospace', lineHeight: 1, mb: '4px' }}>
                {val}
              </Typography>
              <Typography sx={{ fontSize: '0.625rem', color: T.dTextMid, fontFamily: '"DM Mono", monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* By Status */}
        {Object.keys(statusCounts).length > 0 && (
          <Box sx={{ mb: '28px' }}>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: T.dTextLow, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: '"DM Mono", monospace', mb: '12px' }}>
              By Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {Object.entries(statusCounts).map(([status, count], i, arr) => (
                <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '10px', borderBottom: i < arr.length - 1 ? `1px solid ${T.dBorder}` : 'none' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Box sx={{ width: '6px', height: '6px', borderRadius: '50%', bgcolor: STATUS_DOT[status] ?? '#94A3B8', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.8125rem', color: T.dTextMid, textTransform: 'capitalize', fontFamily: '"DM Mono", monospace', letterSpacing: '0.02em' }}>
                      {status}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: T.dTextHigh, fontFamily: '"DM Mono", monospace' }}>
                    {count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Hovered rule preview */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {hoveredRule ? (
            <Box>
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: T.dTextLow, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: '"DM Mono", monospace', mb: '10px' }}>
                Selected
              </Typography>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: T.dTextHigh, letterSpacing: '-0.025em', lineHeight: 1.15, mb: '12px' }}>
                {hoveredRule.name}
              </Typography>
              <Box sx={{ width: '24px', height: '2px', borderRadius: '1px', background: T.indigo, mb: '12px', opacity: 0.7 }} />
              <Typography sx={{ fontSize: '0.8125rem', color: T.dTextMid, lineHeight: 1.75, fontWeight: 400, wordBreak: 'break-word', overflowWrap: 'break-word', overflow: 'hidden' }}>
                {hoveredRule.description || 'No description provided for this rule.'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ opacity: 0.3 }}>
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: T.dTextLow, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: '"DM Mono", monospace', mb: '10px' }}>
                Preview
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: T.dTextMid, lineHeight: 1.75 }}>
                Hover a rule to see its details here.
              </Typography>
            </Box>
          )}
        </Box>

      </Box>    
    </Box>
  );
}