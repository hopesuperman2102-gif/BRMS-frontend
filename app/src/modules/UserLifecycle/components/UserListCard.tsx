'use client';

import { useEffect, useState } from 'react';
import {
  Box, Button, Typography, CircularProgress, IconButton, Menu, MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { brmsTheme } from '../../../core/theme/brmsTheme';
import RcTable from '../../../core/components/RcTable';
import { CreateUserApi } from '../api/createUserApi';
import RcConfirmDialog from 'app/src/core/components/RcConfirmDailog';
import UpdatePasswordDialog from './UpdatePasswordDialog';
import { User, UserListCardProps } from '../types/userTypes';

const { colors } = brmsTheme;

const HeadingBlock = styled(Box)({ marginBottom: '24px' });

const HeadingTitle = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 800,
  color: colors.textOnPrimary,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  marginBottom: '8px',
});

const HeadingSubtitle = styled(Typography)({
  fontSize: '0.8125rem',
  color: colors.panelTextMid,
  fontWeight: 400,
  lineHeight: 1.65,
});

export default function UserListCard({ newUser }: UserListCardProps) {
  const [users, setUsers]                           = useState<User[]>([]);
  const [loading, setLoading]                       = useState(true);
  const [error, setError]                           = useState('');
  const [anchorEl, setAnchorEl]                     = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId]         = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen]     = useState(false);
  const [deleting, setDeleting]                     = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    if (newUser) setUsers((prev) => [...prev, newUser]);
  }, [newUser]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await CreateUserApi.getUsers(1, 100);
      const list = Array.isArray(response) ? response : response?.users || [];
      setUsers(list);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen    = (e: React.MouseEvent<HTMLElement>, id: string) => { e.stopPropagation(); setAnchorEl(e.currentTarget); setSelectedUserId(id); };
  const handleMenuClose   = () => setAnchorEl(null);
  const handleDeleteClick = () => { setDeleteDialogOpen(true); handleMenuClose(); };

  const handleDeleteConfirm = async () => {
    if (!selectedUserId) return;
    setDeleting(true);
    try {
      await CreateUserApi.deleteUser(selectedUserId);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUserId));
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdatePassword = () => { setPasswordDialogOpen(true); handleMenuClose(); };

  const formatRoles = (roles: string[] | undefined) =>
    !roles || !Array.isArray(roles) ? '-' : roles.map((r) => r.replace('_', ' ')).join(', ');

  const tableHeaders = ['Username', 'Email', 'Role', 'Actions'];
  const tableRows = users.map((user) => ({
    Username: user.username,
    Email:    user.email,
    Role:     formatRoles(user.roles),
    Actions: (
      <IconButton
        size="small"
        onClick={(e) => handleMenuOpen(e as React.MouseEvent<HTMLElement>, user.id)}
        sx={{ color: '#ffffff', backgroundColor: '#ffffff', borderRadius: '4px', padding: '4px' }}
      >
        <MoreVertIcon sx={{ fontSize: '18px', color: '#000000' }} />
      </IconButton>
    ),
  }));

  return (
    <>
      {/* ── Heading ── */}
      <HeadingBlock>
        <HeadingTitle>Team Members</HeadingTitle>
        <HeadingSubtitle>
          Manage users, roles, and access permissions for your workspace.
        </HeadingSubtitle>
      </HeadingBlock>

      {/* ── Table / states ── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress size={40} sx={{ color: colors.panelIndigo }} />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column', gap: '12px' }}>
          <Typography sx={{ color: colors.panelTextLow, fontSize: '0.875rem' }}>{error}</Typography>
          <Button size="small" onClick={fetchUsers} sx={{ color: colors.panelIndigo }}>Retry</Button>
        </Box>
      ) : users.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Typography sx={{ color: colors.panelTextLow, fontSize: '0.875rem' }}>No users created yet</Typography>
        </Box>
      ) : (
          <RcTable headers={tableHeaders} rows={tableRows} onRowClick={() => {}} />
      )}

      {/* ── Context menu ── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { background: colors.formBg, border: `1px solid ${colors.panelBorder}`, borderRadius: '6px' } }}
      >
        <MenuItem
          onClick={handleUpdatePassword}
          sx={{ color: colors.panelIndigo, fontSize: '0.875rem', '&:hover': { backgroundColor: colors.primaryGlowSoft } }}
        >
          Update Password
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          sx={{ color: colors.errorText, fontSize: '0.875rem', '&:hover': { backgroundColor: 'rgba(239,68,68,0.12)' } }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* ── Dialogs ── */}
      <RcConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        isDangerous
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <UpdatePasswordDialog
        open={passwordDialogOpen}
        userId={selectedUserId}
        onClose={() => setPasswordDialogOpen(false)}
        onChangePassword={CreateUserApi.changePassword}
      />
    </>
  );
}