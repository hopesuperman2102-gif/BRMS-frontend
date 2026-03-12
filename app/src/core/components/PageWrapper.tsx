'use client';

import { Box, styled } from '@mui/material';

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'fixed',
})<{ fixed?: boolean }>(({ fixed }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: fixed ? 'hidden' : 'visible',
}));

export default function PageWrapper({
  children,
  fixed = false,
}: {
  children: React.ReactNode;
  fixed?: boolean;
}) {
  return (
    <StyledBox fixed={fixed}>
      {children}
    </StyledBox>
  );
}
