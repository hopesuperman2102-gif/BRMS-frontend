'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import AppRouter from './src/core/components/AppRouter';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  );
}
