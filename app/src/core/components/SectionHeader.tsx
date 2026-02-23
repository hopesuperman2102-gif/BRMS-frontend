'use client';

import { Box } from '@mui/material';
import { SectionHeaderProps } from '../types/commonTypes';

export default function SectionHeader({
  left,
  right,
}: SectionHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
      }}
    >
      <Box>{left}</Box>
      <Box>{right}</Box>
    </Box>
  );
}
