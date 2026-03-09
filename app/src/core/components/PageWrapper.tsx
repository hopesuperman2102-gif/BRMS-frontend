'use client';

import { Box } from '@mui/material';

export default function PageWrapper({
  children,
  fixed = false,
}: {
  children: React.ReactNode;
  fixed?: boolean;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      overflow={fixed ? 'hidden' : 'visible'}
    >
      {children}
    </Box>
  );
}
