'use client';

import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { brmsTheme } from '@/core/theme/brmsTheme';
import RcConfirmDialog from '@/core/components/RcConfirmDailog';
import UpdatePasswordDialog from '@/modules/UserLifecycle/components/UpdatePasswordDialog';
import { CreateUserApi } from '@/modules/UserLifecycle/api/createUserApi';

const { colors } = brmsTheme;

type UserListActionMenuProps = {
  anchorEl: null | HTMLElement;
  onClose: () => void;
  onUpdatePassword: () => void;
  onDelete: () => void;
};

export function UserListActionMenu({
  anchorEl,
  onClose,
  onUpdatePassword,
  onDelete,
}: UserListActionMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{ sx: { background: colors.formBg, border: `1px solid ${colors.panelBorder}`, borderRadius: '6px' } }}
    >
      <MenuItem
        onClick={onUpdatePassword}
        sx={{ color: colors.panelIndigo, fontSize: '0.875rem', '&:hover': { backgroundColor: colors.primaryGlowSoft } }}
      >
        Update Password
      </MenuItem>
      <MenuItem
        onClick={onDelete}
        sx={{ color: colors.errorText, fontSize: '0.875rem', '&:hover': { backgroundColor: 'rgba(239,68,68,0.12)' } }}
      >
        Delete
      </MenuItem>
    </Menu>
  );
}

type UserListActionDialogsProps = {
  selectedUserId: string | null;
  deleteDialogOpen: boolean;
  passwordDialogOpen: boolean;
  deleting: boolean;
  onConfirmDelete: () => void;
  onCloseDelete: () => void;
  onClosePassword: () => void;
};

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
