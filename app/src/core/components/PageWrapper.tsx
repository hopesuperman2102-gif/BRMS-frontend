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
      minHeight="100vh"
    >
      {children}
    </Box>
  );
}
