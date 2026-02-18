'use client';

import { Box, Typography } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

export function ExplorerEmptyState() {
  return (
    <Box sx={{ textAlign: 'center', py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <Box sx={{ width: 56, height: 56, borderRadius: '12px', background: '#F8FAFC', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FolderOpenIcon sx={{ fontSize: 24, color: '#94A3B8' }} />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9375rem', mb: '4px', letterSpacing: '-0.01em' }}>
          This folder is empty
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
          Create a rule or folder to get started
        </Typography>
      </Box>
    </Box>
  );
}