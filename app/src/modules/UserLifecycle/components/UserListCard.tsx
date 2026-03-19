'use client';

import { useState, type MouseEvent } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { UserListCardProps } from '@/modules/UserLifecycle/types/userTypes';
import { useUsers } from '@/modules/UserLifecycle/hooks/useUsers';
import UserListTable from '@/modules/UserLifecycle/components/UserListTable';
import { UserListActionDialogs, UserListActionMenu } from '@/modules/UserLifecycle/components/UserListActions';

const { colors } = brmsTheme;

const CardRoot = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
});

const HeadingBlock = styled(Box)({
  marginBottom: '10px',
  flexShrink: 0,
});

const TableRegion = styled(Box)({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const HeadingTitle = styled(Typography)({
  fontSize: '1.2rem',
  fontWeight: 800,
  color: colors.textOnPrimary,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  marginBottom: '4px',
});

const HeadingSubtitle = styled(Typography)({
  fontSize: '0.75rem',
  color: colors.panelTextMid,
  fontWeight: 400,
  lineHeight: 1.45,
});

export default function UserListCard({ newUser }: UserListCardProps) {
  const { users, loading, error, fetchUsers, deleteUserById } = useUsers(newUser);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const handleMenuOpen = (e: MouseEvent<HTMLElement>, id: string) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedUserId(id);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUserId) return;
    setDeleting(true);
    try {
      await deleteUserById(selectedUserId);
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    } catch {
      // Error state is already handled in useUsers.
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdatePassword = () => {
    setPasswordDialogOpen(true);
    handleMenuClose();
  };

  return (
    <CardRoot>
      <HeadingBlock>
        <HeadingTitle>Team Members</HeadingTitle>
        <HeadingSubtitle>
          Manage users, roles, and access permissions for your workspace.
        </HeadingSubtitle>
      </HeadingBlock>

      <TableRegion>
        <UserListTable
          users={users}
          loading={loading}
          error={error}
          onRetry={() => void fetchUsers()}
          onOpenMenu={handleMenuOpen}
        />
      </TableRegion>

      <UserListActionMenu
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        onUpdatePassword={handleUpdatePassword}
        onDelete={handleDeleteClick}
      />

      <UserListActionDialogs
        selectedUserId={selectedUserId}
        deleteDialogOpen={deleteDialogOpen}
        passwordDialogOpen={passwordDialogOpen}
        deleting={deleting}
        onConfirmDelete={() => void handleDeleteConfirm()}
        onCloseDelete={() => setDeleteDialogOpen(false)}
        onClosePassword={() => setPasswordDialogOpen(false)}
      />
    </CardRoot>
  );
}
