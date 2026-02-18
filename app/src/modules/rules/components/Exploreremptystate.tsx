import { Box, Typography } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

export function ExplorerEmptyState() {
  return (
    <Box sx={{ textAlign: 'center', py: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box sx={{
        width: 68, height: 68, borderRadius: '20px',
        background: 'linear-gradient(145deg, #F5F3FF 0%, #EDE9FE 100%)',
        border: '1.5px dashed #C4B5FD',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <FolderOpenIcon sx={{ fontSize: 30, color: '#A78BFA' }} />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.9375rem', mb: 0.5 }}>
          This folder is empty
        </Typography>
      </Box>
    </Box>
  );
}