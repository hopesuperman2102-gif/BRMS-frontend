'use client';

import React from 'react';
import { Box, Button, CircularProgress, IconButton, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RcTable from '@/core/components/RcTable';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { User } from '@/modules/UserLifecycle/types/userTypes';

const { colors } = brmsTheme;

type UserListTableProps = {
  users: User[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onOpenMenu: (event: React.MouseEvent<HTMLElement>, userId: string) => void;
};

const formatRoles = (roles: string[] | undefined) =>
  !roles || !Array.isArray(roles) ? '-' : roles.map((r) => r.replace('_', ' ')).join(', ');

export default function UserListTable({
  users,
  loading,
  error,
  onRetry,
  onOpenMenu,
}: UserListTableProps) {
  const tableHeaders = ['Username', 'Email', 'Role', 'Actions'];
  const tableRows = users.map((user) => ({
    Username: user.username,
    Email: user.email,
    Role: formatRoles(user.roles),
    Actions: (
      <IconButton
        size="small"
        onClick={(e) => onOpenMenu(e, user.id)}
        sx={{ color: brmsTheme.colors.textDark, backgroundColor: brmsTheme.colors.white, borderRadius: '4px', padding: '4px' }}
      >
        <MoreVertIcon sx={{ fontSize: '18px', color: brmsTheme.colors.textDark }} />
      </IconButton>
    ),
  }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <CircularProgress size={40} sx={{ color: colors.panelIndigo }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column', gap: '12px' }}>
        <Typography sx={{ color: colors.panelTextLow, fontSize: '0.875rem' }}>{error}</Typography>
        <Button size="small" onClick={onRetry} sx={{ color: colors.panelIndigo }}>Retry</Button>
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Typography sx={{ color: colors.panelTextLow, fontSize: '0.875rem' }}>No users created yet</Typography>
      </Box>
    );
  }

  return <RcTable headers={tableHeaders} rows={tableRows} onRowClick={() => {}} />;
}
