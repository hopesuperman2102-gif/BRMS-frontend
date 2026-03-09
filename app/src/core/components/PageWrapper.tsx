'use client';

import { Box } from '@mui/material';

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"       
      overflow="hidden"     // ✅ prevents page-level scroll
    >
      {children}
    </Box>
  );
}
