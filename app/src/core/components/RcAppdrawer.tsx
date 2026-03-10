'use client';

import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { AppDrawerProps } from '../types/commonTypes';

const { colors } = brmsTheme;

const DrawerBody = styled(Box)<{ ownerState: { width: number } }>(({ ownerState }) => ({
  width: ownerState.width,
  maxWidth: '100vw',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  fontFamily: brmsTheme.fonts.sans,
}));

const StyledDrawer = styled(Drawer)<{ width: number; anchor: string }>(({ width, anchor }) => ({
  '& .MuiDrawer-paper': {
    width: width,
    maxWidth: '100vw',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    borderRadius: anchor === 'right' ? '16px 0 0 16px' : '0 16px 16px 0',
    overflow: 'hidden',
  },
}));

const DrawerHeader = styled(Box)({
  padding: 24,
  borderBottom: `1px solid ${colors.lightBorder}`,
  background: `linear-gradient(135deg, ${colors.white} 0%, ${colors.formBg} 100%)`,
  position: 'relative',
});

const DrawerTitle = styled(Typography)<{ hasSubtitle?: boolean }>(({ hasSubtitle }) => ({
  fontSize: '1.1rem',
  fontWeight: 700,
  color: colors.lightTextHigh,
  marginBottom: hasSubtitle ? 4 : 0,
}));

const DrawerSubtitle = styled(Typography)({
  fontSize: '0.85rem',
  color: colors.lightTextMid,
  fontWeight: 500,
});

const DrawerCloseButton = styled(IconButton)({
  color: colors.lightTextMid,
  '&:hover': {
    backgroundColor: colors.lightSurfaceHover,
    color: colors.lightTextHigh,
  },
});

const DrawerContent = styled(Box)({
  padding: 24,
  flex: 1,
  overflowY: 'auto',
  backgroundColor: colors.formBg,
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: colors.white,
  },
  '&::-webkit-scrollbar-thumb': {
    background: colors.lightBorder,
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: colors.lightBorderHover,
  },
});

const DrawerFooter = styled(Stack)({
  padding: 16,
  backgroundColor: colors.white,
  borderTop: `1px solid ${colors.lightBorder}`,
});

const DrawerActionButton = styled(Button)({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
});

export default function RcAppDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions = [],
  width = 380,
  anchor = 'right',
}: AppDrawerProps) {
  return (
    <StyledDrawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      width={width}
    >
      <DrawerBody ownerState={{ width }}>

        {/* ── Header ── */}
        <DrawerHeader>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <DrawerTitle hasSubtitle={!!subtitle}>
                {title}
              </DrawerTitle>
              {subtitle && (
                <DrawerSubtitle>
                  {subtitle}
                </DrawerSubtitle>
              )}
            </Box>
            <DrawerCloseButton size="medium" onClick={onClose}>
              <CloseIcon />
            </DrawerCloseButton>
          </Stack>
        </DrawerHeader>

        {/* ── Body ── */}
        <DrawerContent>
          {children}
        </DrawerContent>

        {/* ── Footer ── */}
        {actions.length > 0 && (
          <>
            <Divider />
            <DrawerFooter direction="row" spacing={1.5}>
              {actions.map((action) => (
                <DrawerActionButton
                  key={action.label}
                  fullWidth
                  variant={action.variant ?? 'contained'}
                  color={action.color ?? 'primary'}
                  disabled={action.disabled || action.loading}
                  onClick={action.onClick}
                >
                  {action.loading && action.loadingLabel ? action.loadingLabel : action.label}
                </DrawerActionButton>
              ))}
            </DrawerFooter>
          </>
        )}

      </DrawerBody>
    </StyledDrawer>
  );
}