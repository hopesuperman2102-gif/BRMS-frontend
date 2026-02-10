// Central BRMS design tokens: colors, gradients, shadows, scrollbars
// Use these instead of hard‑coding hex values in components.

export const brmsTheme = {
  colors: {
    primary: '#6552D0',
    primaryHover: '#5443B8',
    primaryDark: '#17203D',
    textOnPrimary: '#ffffff',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #6552D0 0%, #17203D 100%)',
    primaryHover: 'linear-gradient(135deg, #5443B8 0%, #14192F 100%)',
  },
  shadows: {
    primarySoft: '0 4px 12px rgba(101, 82, 208, 0.3)',
    primaryHover: '0 6px 16px rgba(101, 82, 208, 0.4)',
  },
  scrollbars: {
    thumb: 'rgba(101, 82, 208, 0.2)',
    thumbHover: 'rgba(101, 82, 208, 0.3)',
  },
};

