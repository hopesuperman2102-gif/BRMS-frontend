import { Box, Typography, IconButton } from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { FileNode } from '../types/Explorertypes';
import { fmtDate, StatusPill } from '../pages/ProjectRulePage';

interface FileCardProps {
  item: FileNode;
  onOpen: () => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
}

export function FileCard({ item, onOpen, onMenuOpen }: FileCardProps) {
  return (
    <Box
      onClick={onOpen}
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2, py: 1.375, borderRadius: '10px',
        border: '1px solid #E5E7EB', backgroundColor: '#FAFAFA',
        cursor: 'pointer', transition: 'all 0.18s ease',
        '&:hover': {
          borderColor: '#C4B5FD', backgroundColor: '#FDFCFF',
          boxShadow: '0 2px 10px rgba(101, 82, 208, 0.08)',
          transform: 'translateY(-1px)',
          '& .file-action': { opacity: 1 },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
          background: 'linear-gradient(145deg, #EEF2FF 0%, #E0E7FF 100%)',
          boxShadow: '0 1px 4px rgba(99,102,241,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <InsertDriveFileOutlinedIcon sx={{ color: '#6366f1', fontSize: 17 }} />
        </Box>

        <Typography sx={{
          fontWeight: 600, fontSize: '0.9rem', color: '#111827',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          minWidth: 100, flexShrink: 0, mr: 1.5,
        }}>
          {item.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden', flexWrap: 'nowrap' }}>
          <StatusPill status={item.status} />

          <Box sx={{
            display: 'inline-flex', alignItems: 'center',
            px: 0.875, py: 0.25, borderRadius: '6px',
            border: '1px solid #E5E7EB', bgcolor: '#F9FAFB',
          }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6552D0', letterSpacing: '0.02em' }}>
              version : {item.version}
            </Typography>
          </Box>

          <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Updated {fmtDate(item.updatedAt)}
          </Typography>
        </Box>
      </Box>

      <IconButton
        className="file-action"
        size="small"
        onClick={(e) => { e.stopPropagation(); onMenuOpen(e); }}
        sx={{ opacity: 0, ml: 1, width: 30, height: 30, borderRadius: '7px', color: '#9CA3AF', flexShrink: 0, transition: 'all 0.15s', '&:hover': { bgcolor: '#EEF2FF', color: '#6366f1' } }}
      >
        <MoreVertIcon sx={{ fontSize: 17 }} />
      </IconButton>
    </Box>
  );
}