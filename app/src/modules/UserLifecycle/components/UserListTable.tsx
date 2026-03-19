'use client';

import React from 'react';
import { Box, Button, CircularProgress, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RcTable from '@/core/components/RcTable';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { User } from '@/modules/UserLifecycle/types/userTypes';

const { colors } = brmsTheme;

const ActionsButton = styled(IconButton)({
  width: '28px',
  height: '28px',
  color: colors.white,
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '0',
  padding: '4px',
  '&:hover': {
    backgroundColor: 'transparent',
  },
});

const ActionsIcon = styled(MoreVertIcon)({
  fontSize: '16px',
  color: colors.white,
});

const CenteredBox = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
});

const CenteredColumnBox = styled(CenteredBox)({
  flexDirection: 'column',
  gap: '12px',
});

const LoadingProgress = styled(CircularProgress)({
  color: colors.panelIndigo,
});

const InfoText = styled(Typography)({
  color: colors.panelTextLow,
  fontSize: '0.875rem',
});

const RetryButton = styled(Button)({
  color: colors.panelIndigo,
});

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
      <ActionsButton
        size="small"
        onClick={(e) => onOpenMenu(e, user.id)}
      >
        <ActionsIcon />
      </ActionsButton>
    ),
  }));

  if (loading) {
    return (
      <CenteredBox>
        <LoadingProgress size={40} />
      </CenteredBox>
    );
  }

  if (error) {
    return (
      <CenteredColumnBox>
        <InfoText>{error}</InfoText>
        <RetryButton size="small" onClick={onRetry}>Retry</RetryButton>
      </CenteredColumnBox>
    );
  }

  if (users.length === 0) {
    return (
      <CenteredBox>
        <InfoText>No users created yet</InfoText>
      </CenteredBox>
    );
  }

  return <RcTable headers={tableHeaders} rows={tableRows} onRowClick={() => {}} />;
}
