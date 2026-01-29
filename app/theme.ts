'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4f46e5', // indigo-ish like your screenshot
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
});

export default theme;
