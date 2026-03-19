'use client';

import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { brmsTheme } from '@/core/theme/brmsTheme';
import RcConfirmDialog from '@/core/components/RcConfirmDailog';
import UpdatePasswordDialog from '@/modules/UserLifecycle/components/UpdatePasswordDialog';
import { CreateUserApi } from '@/modules/UserLifecycle/api/createUserApi';
import { UserListActionDialogsProps, UserListActionMenuProps } from '../types/userTypes';

const { colors } = brmsTheme;

const StyledMenu = styled(Menu)({
  '& .MuiPaper-root': {
    background: colors.formBg,
    border: `1px solid ${colors.panelBorder}`,
    borderRadius: '6px',
  },
});

const UpdatePasswordMenuItem = styled(MenuItem)({
  color: colors.panelIndigo,
  fontSize: '0.875rem',
  '&:hover': { backgroundColor: colors.primaryGlowSoft },
});

const DeleteMenuItem = styled(MenuItem)({
  color: colors.errorText,
  fontSize: '0.875rem',
  '&:hover': { backgroundColor: 'rgba(239,68,68,0.12)' },
});

export function UserListActionMenu({
  anchorEl,
  onClose,
  onUpdatePassword,
  onDelete,
}: UserListActionMenuProps) {
  return (
    <StyledMenu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <UpdatePasswordMenuItem onClick={onUpdatePassword}>
        Update Password
      </UpdatePasswordMenuItem>
      <DeleteMenuItem onClick={onDelete}>
        Delete
      </DeleteMenuItem>
    </StyledMenu>
  );
}

export function UserListActionDialogs({
  selectedUserId,
  deleteDialogOpen,
  passwordDialogOpen,
  deleting,
  onConfirmDelete,
  onCloseDelete,
  onClosePassword,
}: UserListActionDialogsProps) {
  return (
    <>
      <RcConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        isDangerous
        onConfirm={onConfirmDelete}
        onCancel={onCloseDelete}
      />

      <UpdatePasswordDialog
        open={passwordDialogOpen}
        userId={selectedUserId}
        onClose={onClosePassword}
        onChangePassword={CreateUserApi.changePassword}
      />
    </>
  );
}
