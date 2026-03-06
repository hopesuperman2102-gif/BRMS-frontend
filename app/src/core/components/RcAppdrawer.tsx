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
import { ReactNode } from 'react';
import { brmsTheme } from '@/core/theme/brmsTheme';

const { colors } = brmsTheme;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DrawerAction {
  label: string;
  loadingLabel?: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  variant?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: DrawerAction[];    // footer buttons — rendered left to right, each fullWidth
  width?: number;              // default 380
  anchor?: 'right' | 'left';  // default 'right'
}

// ─── Styled ──────────────────────────────────────────────────────────────────

const DrawerBody = styled(Box)<{ ownerState: { width: number } }>(({ ownerState }) => ({
  width: ownerState.width,
  maxWidth: '100vw',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  fontFamily: brmsTheme.fonts.sans,
}));

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
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: width,
          maxWidth: '100vw',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          borderRadius: anchor === 'right' ? '16px 0 0 16px' : '0 16px 16px 0',
          overflow: 'hidden',
        },
      }}
    >
      <DrawerBody ownerState={{ width }}>

        {/* ── Header ── */}
        <Box
          sx={{
            p: 3,
            borderBottom: `1px solid ${colors.lightBorder}`,
            background: `linear-gradient(135deg, ${colors.white} 0%, ${colors.formBg} 100%)`,
            position: 'relative',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: colors.lightTextHigh,
                  mb: subtitle ? 0.5 : 0,
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    color: colors.lightTextMid,
                    fontWeight: 500,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            <IconButton
              size="medium"
              onClick={onClose}
              sx={{
                color: colors.lightTextMid,
                '&:hover': {
                  backgroundColor: colors.lightSurfaceHover,
                  color: colors.lightTextHigh,
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* ── Body ── */}
        <Box
          sx={{
            p: 3,
            flex: 1,
            overflowY: 'auto',
            bgcolor: colors.formBg,
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
          }}
        >
          {children}
        </Box>

        {/* ── Footer ── */}
        {actions.length > 0 && (
          <>
            <Divider />
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                p: 2,
                bgcolor: colors.white,
                borderTop: `1px solid ${colors.lightBorder}`,
              }}
            >
              {actions.map((action) => (
                <Button
                  key={action.label}
                  fullWidth
                  variant={action.variant ?? 'contained'}
                  color={action.color ?? 'primary'}
                  disabled={action.disabled || action.loading}
                  onClick={action.onClick}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {action.loading && action.loadingLabel ? action.loadingLabel : action.label}
                </Button>
              ))}
            </Stack>
          </>
        )}

      </DrawerBody>
    </Drawer>
  );
}