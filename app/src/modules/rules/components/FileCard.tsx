'use client';

import { Box, Typography, IconButton } from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { FileNode } from '../types/Explorertypes';
import { fmtDate } from '../pages/ProjectRulePage';

/* ─── Status pill — restrained palette ───────────────────── */
const STATUS_MAP: Record<string, { bg: string; color: string; dot: string; border: string }> = {
  using:      { bg: '#F0FDF4', color: '#166534', dot: '#22C55E', border: '#BBF7D0' },
  active:     { bg: '#F0FDF4', color: '#166534', dot: '#22C55E', border: '#BBF7D0' },
  draft:      { bg: '#FAFAF9', color: '#57534E', dot: '#A8A29E', border: '#E7E5E4' },
  inactive:   { bg: '#FFF7ED', color: '#9A3412', dot: '#FB923C', border: '#FED7AA' },
  deprecated: { bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444', border: '#FECACA' },
};

export function StatusPill({ status }: { status: string }) {
  const s = (status ?? 'draft').toLowerCase();
  const style = STATUS_MAP[s] ?? { bg: '#F8FAFC', color: '#475569', dot: '#94A3B8', border: '#E2E8F0' };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px', px: '7px', py: '2px', borderRadius: '4px', bgcolor: style.bg, border: `1px solid ${style.border}` }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: style.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: style.color, textTransform: 'capitalize', letterSpacing: '0.03em', fontFamily: '"DM Mono", monospace' }}>
        {status}
      </Typography>
    </Box>
  );
}

/* ─── FileCard ────────────────────────────────────────────── */
interface FileCardProps {
  item: FileNode;
  onOpen: () => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function FileCard({ item, onOpen, onMenuOpen, onMouseEnter, onMouseLeave }: FileCardProps) {
  return (
    <Box
      onClick={onOpen}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: '16px', py: '12px', borderRadius: '8px',
        border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF',
        cursor: 'pointer', transition: 'all 0.15s',
        '&:hover': {
          borderColor: '#4F46E5',
          boxShadow: '0 0 0 3px rgba(79,70,229,0.08)',
          transform: 'translateY(-1px)',
          '& .file-action': { opacity: 1 },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        {/* Icon */}
        <Box sx={{ width: 34, height: 34, borderRadius: '8px', flexShrink: 0, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <InsertDriveFileOutlinedIcon sx={{ color: '#64748B', fontSize: 16 }} />
        </Box>

        {/* Name + meta */}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: '4px', letterSpacing: '-0.01em' }}>
            {item.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <StatusPill status={item.status} />
            <Box sx={{ display: 'inline-flex', alignItems: 'center', px: '7px', py: '2px', borderRadius: '4px', border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#4F46E5', letterSpacing: '0.03em', fontFamily: '"DM Mono", monospace' }}>
                version : {item.version}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.6875rem', color: '#94A3B8', whiteSpace: 'nowrap', fontFamily: '"DM Mono", monospace' }}>
              {fmtDate(item.updatedAt)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu */}
      <IconButton
        className="file-action"
        size="small"
        onClick={(e) => { e.stopPropagation(); onMenuOpen(e); }}
        disableRipple
        sx={{ opacity: 0, ml: '8px', width: 28, height: 28, borderRadius: '6px', color: '#94A3B8', flexShrink: 0, transition: 'all 0.15s', '&:hover': { bgcolor: '#F1F5F9', color: '#475569' } }}
      >
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
}