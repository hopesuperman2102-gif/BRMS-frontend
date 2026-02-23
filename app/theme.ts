'use client';

import { createTheme } from '@mui/material/styles';
import { brmsTheme } from './src/core/theme/brmsTheme';

const theme = createTheme({
  palette: {
    primary: {
      main: brmsTheme.colors.primary,
    },
  },
  typography: {
    fontFamily: brmsTheme.fonts.sans,
  },
});

export default theme;
