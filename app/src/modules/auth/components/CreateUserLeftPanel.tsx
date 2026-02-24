'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { brmsTheme } from '../../../core/theme/brmsTheme';

import RcTable from '../../../core/components/RcTable';
import { CreateUserApi } from '../api/createUserApi';

const { colors, fonts } = brmsTheme;

/* ─── Styled Components ───────────────────────────────────── */

const LeftPanelRoot = styled(Box)({
  display: 'none',
  '@media (min-width: 1200px)': { display: 'flex' },
  flexDirection: 'column',
  width: '42%',
  flexShrink: 0,
  height: '100vh',
  position: 'relative',
  overflow: 'hidden',
  background: colors.panelBg,
  borderRight: `1px solid ${colors.panelBorder}`,
});

const IndigoVignette = styled(Box)({
  position: 'absolute',
  bottom: -80,
  left: -80,
  width: 400,
  height: 400,
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(79,70,229,0.14) 0%, transparent 60%)',
  pointerEvents: 'none',
});

const DotGrid = styled(Box)({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  opacity: 0.09,
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
  backgroundSize: '28px 28px',
});

const ContentWrapper = styled(Box)({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '40px 24px',
});

const BackButtonWrapper = styled(Box)({
  flexShrink: 0,
  marginBottom: '24px',
});

const BackButton = styled(Button)({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.75rem',
  color: colors.panelTextMid,
  paddingLeft: 0,
  paddingRight: 0,
  minWidth: 0,
  background: 'none',
  letterSpacing: '0.02em',
  gap: '4px',
  '&:hover': {
    color: colors.textOnPrimary,
    background: 'none',
  },
  transition: 'color 0.15s',
});

const HeadingBlock = styled(Box)({
  marginBottom: '24px',
});

const HeadingTitle = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 800,
  color: colors.lightTextHigh,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  marginBottom: '8px',
});

const HeadingSubtitle = styled(Typography)({
  fontSize: '0.8125rem',
  color: colors.lightTextMid,
  fontWeight: 400,
  lineHeight: 1.65,
});

const TableWrapper = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  overflow: 'hidden',
  padding: '24px',
  background: colors.white,
  borderRadius: '12px',
  border: `1px solid ${colors.lightBorder}`,
  '& table': {
    '& thead th': {
      fontSize: '0.875rem !important',
      fontWeight: '700 !important',
      padding: '14px 16px !important',
    },
    '& tbody td': {
      fontSize: '0.9375rem !important',
      padding: '16px !important',
    },
    '& tbody tr': {
      height: '60px',
    },
  },
});

/* ─── Component ───────────────────────────────────────────── */

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  created_at: string;
}

export default function CreateUserLeftPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await CreateUserApi.getUsers(1, 100);
      const usersList = Array.isArray(response) ? response : response?.users || [];
      setUsers(usersList || []);
      setError('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch users');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUserId) return;
    setDeleting(true);
    try {
      await CreateUserApi.deleteUser(selectedUserId);
      setUsers(users.filter(u => u.id !== selectedUserId));
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete user');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!selectedUserId) return;
    console.log('Update password for user:', selectedUserId);
    handleMenuClose();
  };

  const formatRoles = (roles: string[] | undefined) => {
    if (!roles || !Array.isArray(roles)) return '-';
    return roles.map(role => role.replace('_', ' ')).join(', ');
  };

  const tableHeaders = ['Username', 'Email', 'Role', 'Actions'];
  const tableRows = (users || []).map((user) => ({
    'Username': user.username,
    'Email': user.email,
    'Role': formatRoles(user.roles),
    'Actions': (
      <IconButton
        size="small"
        onClick={(e) => handleMenuOpen(e as any, user.id)}
        sx={{
          color: '#ffffff',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          padding: '4px',
        }}
      >
        <MoreVertIcon sx={{ fontSize: '18px', color: '#000000' }} />
      </IconButton>
    ),
  }));

  return (
    <LeftPanelRoot>
      <IndigoVignette />
      <DotGrid />

      <ContentWrapper>
        <BackButtonWrapper>
          <BackButton
            startIcon={<ArrowBackIcon sx={{ fontSize: '12px !important' }} />}
            onClick={() => navigate(-1)}
            disableRipple
          >
            Back
          </BackButton>
        </BackButtonWrapper>

        <HeadingBlock>
          <HeadingTitle>Team Members</HeadingTitle>
          <HeadingSubtitle>
            Manage users, roles, and access permissions for your workspace.
          </HeadingSubtitle>
        </HeadingBlock>

        {/* Loading State */}
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <CircularProgress size={40} sx={{ color: colors.panelIndigo }} />
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <Typography sx={{ color: colors.panelTextLow, fontSize: '0.875rem' }}>
              {error}
            </Typography>
            <Button size="small" onClick={fetchUsers} sx={{ color: colors.panelIndigo }}>
              Retry
            </Button>
          </Box>
        ) : users.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <Typography sx={{ color: colors.panelTextLow, fontSize: '0.875rem' }}>
              No users created yet
            </Typography>
          </Box>
        ) : (
          <TableWrapper>
            <RcTable
              headers={tableHeaders}
              rows={tableRows}
              onRowClick={() => {}}
            />
          </TableWrapper>
        )}
      </ContentWrapper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: colors.formBg,
            border: `1px solid ${colors.panelBorder}`,
            borderRadius: '6px',
          },
        }}
      >
        <MenuItem
          onClick={handleUpdatePassword}
          sx={{
            color: colors.panelIndigo,
            fontSize: '0.875rem',
            '&:hover': {
              backgroundColor: colors.primaryGlowSoft,
            },
          }}
        >
          Update Password
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          sx={{
            color: colors.errorText,
            fontSize: '0.875rem',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
            },
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: colors.formBg,
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle sx={{ color: colors.textOnPrimary, fontWeight: 700 }}>
          Delete User
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.lightTextHigh, mt: 2 }}>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: colors.panelTextMid }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            sx={{
              color: colors.errorText,
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
              },
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </LeftPanelRoot>
  );
}