'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import dynamic from 'next/dynamic';

// Dynamically import AppRouter with SSR disabled to avoid "document is not defined" error
const AppRouter = dynamic(() => import('./src/core/components/AppRouter'), {
  ssr: false,
});

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
      {children}
    </ThemeProvider>
  );
}
