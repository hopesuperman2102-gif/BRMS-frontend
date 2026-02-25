'use client';

import {
  Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, InputAdornment, Alert,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { brmsTheme } from '../../../core/theme/brmsTheme';

const { colors, fonts } = brmsTheme;

/* ─── Password input sx ── */
const inputSx = (focused: boolean, error?: boolean) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: colors.white,
    transition: 'box-shadow 0.15s, border-color 0.15s',
    ...(focused && !error && { boxShadow: `0 0 0 3px ${colors.panelIndigoGlow}` }),
    ...(error && { boxShadow: `0 0 0 3px rgba(239,68,68,0.12)` }),
    '& fieldset': {
      borderColor: error ? colors.errorBorder : focused ? colors.panelIndigo : colors.lightBorder,
      borderWidth: focused || error ? '1.5px' : '1px',
      transition: 'border-color 0.15s',
    },
    '&:hover fieldset': {
      borderColor: error ? colors.errorBorder : focused ? colors.panelIndigo : colors.lightBorderHover,
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
    fontFamily: fonts.mono,
    color: colors.lightTextHigh,
    padding: '10px 14px',
    letterSpacing: '0.01em',
    '&::placeholder': {
      color: colors.lightTextLow,
      opacity: 1,
      fontFamily: fonts.mono,
    },
  },
});

/* ─── Password strength ── */
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains a letter', pass: /[a-zA-Z]/.test(password) },
  ];
  const strength = checks.filter(c => c.pass).length;
  const barColor = strength === 1 ? '#ef4444' : strength === 2 ? '#ed6c02' : '#22c55e';
  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', gap: '4px', mb: '8px' }}>
        {[1, 2, 3].map(i => (
          <Box key={i} sx={{ flex: 1, height: '3px', borderRadius: '99px', background: i <= strength ? barColor : colors.lightBorder, transition: 'background 0.2s' }} />
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {checks.map(c => (
          <Box key={c.label} sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: c.pass ? '#22c55e' : colors.lightTextLow, transition: 'background 0.2s' }} />
            <Typography sx={{ fontSize: '0.6875rem', fontFamily: fonts.mono, color: c.pass ? colors.lightTextMid : colors.lightTextLow, transition: 'color 0.2s' }}>
              {c.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ─── Props ── */
interface UpdatePasswordDialogProps {
  open: boolean;
  userId: string | null;
  onClose: () => void;
  onChangePassword: (userId: string, newPassword: string) => Promise<unknown>;
}

/* ─── Component ── */
export default function UpdatePasswordDialog({ open, userId, onClose, onChangePassword }: UpdatePasswordDialogProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const passwordMismatch = !!confirmPassword && newPassword !== confirmPassword;

  const handleClose = () => {
    if (updatingPassword) return;
    setPasswordError('');
    setPasswordSuccess(false);
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleConfirm = async () => {
    setPasswordError('');
    if (!newPassword) { setPasswordError('New password is required.'); return; }
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    if (!userId) return;

    setUpdatingPassword(true);
    try {
      await onChangePassword(userId, newPassword);
      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordSuccess(false);
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          background: colors.formBg,
          borderRadius: '8px',
          width: '100%',
          maxWidth: '400px',
        },
      }}
    >
      <DialogTitle sx={{ color: colors.textOnPrimary, fontWeight: 700, pb: 1, pr: '48px' }}>
        Update Password
        <IconButton
          onClick={handleClose}
          disabled={updatingPassword}
          size="small"
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: colors.lightTextLow,
            '&:hover': { color: colors.lightTextMid },
          }}
        >
          <CloseIcon sx={{ fontSize: '18px' }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '20px', pt: '16px !important' }}>

        {/* Error */}
        {passwordError && (
          <Alert
            severity="error"
            sx={{
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              background: colors.errorBg,
              border: `1px solid ${colors.errorBorder}`,
              color: colors.errorText,
              '& .MuiAlert-icon': { color: colors.errorIcon, fontSize: '1rem' },
            }}
          >
            {passwordError}
          </Alert>
        )}

        {/* Success */}
        {passwordSuccess && (
          <Alert
            severity="success"
            sx={{
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#166534',
              '& .MuiAlert-icon': { color: '#22c55e', fontSize: '1rem' },
            }}
          >
            Password updated successfully.
          </Alert>
        )}

        {/* New Password */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6px' }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: colors.lightTextMid, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: fonts.mono }}>
              New Password
            </Typography>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: colors.panelIndigo, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: fonts.mono, opacity: 0.75 }}>
              required
            </Typography>
          </Box>
          <TextField
            fullWidth
            type={showNewPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
            onFocus={() => setPasswordFocused('new')}
            onBlur={() => setPasswordFocused(null)}
            autoComplete="new-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ fontSize: '16px', color: colors.lightTextLow }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end" disableRipple sx={{ color: colors.lightTextLow, mr: '-4px' }}>
                    {showNewPassword ? <VisibilityOff sx={{ fontSize: '16px' }} /> : <Visibility sx={{ fontSize: '16px' }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={inputSx(passwordFocused === 'new')}
          />
          <PasswordStrength password={newPassword} />
        </Box>

        {/* Confirm Password */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6px' }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: colors.lightTextMid, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: fonts.mono }}>
              Confirm Password
            </Typography>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: colors.panelIndigo, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: fonts.mono, opacity: 0.75 }}>
              required
            </Typography>
          </Box>
          <TextField
            fullWidth
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
            onFocus={() => setPasswordFocused('confirm')}
            onBlur={() => setPasswordFocused(null)}
            autoComplete="new-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ fontSize: '16px', color: passwordMismatch ? colors.errorIcon : colors.lightTextLow }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" disableRipple sx={{ color: colors.lightTextLow, mr: '-4px' }}>
                    {showConfirmPassword ? <VisibilityOff sx={{ fontSize: '16px' }} /> : <Visibility sx={{ fontSize: '16px' }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={inputSx(passwordFocused === 'confirm', passwordMismatch)}
          />
          {passwordMismatch && (
            <Typography sx={{ mt: '6px', fontSize: '0.6875rem', color: colors.errorText, fontFamily: fonts.mono }}>
              Passwords do not match
            </Typography>
          )}
        </Box>

      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: '8px' }}>
        <Button
          onClick={handleClose}
          disabled={updatingPassword}
          sx={{ color: colors.panelTextMid, textTransform: 'none', fontWeight: 500 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={updatingPassword || passwordMismatch || !newPassword}
          sx={{
            borderRadius: '6px',
            px: '20px',
            py: '8px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.8125rem',
            color: colors.white,
            background: colors.panelIndigo,
            boxShadow: `0 1px 3px rgba(0,0,0,0.12), 0 4px 12px ${colors.panelIndigoGlow}`,
            '&:hover': { background: colors.panelIndigoHover },
            '&:disabled': { background: colors.lightBorder, color: colors.lightTextLow, boxShadow: 'none' },
            transition: 'all 0.15s',
          }}
        >
          {updatingPassword ? 'Updating...' : 'Update Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}