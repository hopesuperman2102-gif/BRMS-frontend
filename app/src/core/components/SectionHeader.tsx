'use client';

import { Box } from '@mui/material';
import { ReactNode } from 'react';

type SectionHeaderProps = {
  left: ReactNode;
  right?: ReactNode;
};

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
