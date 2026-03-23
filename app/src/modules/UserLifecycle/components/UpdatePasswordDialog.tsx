'use client';

import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { UpdatePasswordDialogProps } from '@/modules/UserLifecycle/types/userTypes';

const { colors, fonts } = brmsTheme;

type InputStateProps = {
  $focused: boolean;
  $error?: boolean;
};

type CheckStateProps = {
  $pass: boolean;
};

type StrengthBarProps = {
  $active: boolean;
  $barColor: string;
};

const sharedInputStyles = ({ $focused, $error }: InputStateProps) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: colors.white,
    transition: 'box-shadow 0.15s, border-color 0.15s',
    ...($focused && !$error && { boxShadow: `0 0 0 3px ${colors.panelIndigoGlow}` }),
    ...($error && { boxShadow: '0 0 0 3px rgba(239,68,68,0.12)' }),
    '& fieldset': {
      borderColor: $error ? colors.errorBorder : $focused ? colors.panelIndigo : colors.lightBorder,
      borderWidth: $focused || $error ? '1.5px' : '1px',
      transition: 'border-color 0.15s',
    },
    '&:hover fieldset': {
      borderColor: $error ? colors.errorBorder : $focused ? colors.panelIndigo : colors.lightBorderHover,
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

const StyledDialog = styled(Dialog)({
  '& .MuiPaper-root': {
    background: colors.formBg,
    borderRadius: '8px',
    width: '100%',
    maxWidth: '400px',
  },
});

const StyledDialogTitle = styled(DialogTitle)({
  color: colors.textOnPrimary,
  fontWeight: 700,
  paddingBottom: '8px',
  paddingRight: '48px',
});

const CloseButton = styled(IconButton)({
  position: 'absolute',
  right: 12,
  top: 12,
  color: colors.lightTextLow,
  '&:hover': { color: colors.lightTextMid },
});

const CloseButtonIcon = styled(CloseIcon)({
  fontSize: '18px',
});

const StyledDialogContent = styled(DialogContent)({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  paddingTop: '16px !important',
});

const StyledAlert = styled(Alert)({
  borderRadius: '6px',
  fontSize: '0.8125rem',
  fontWeight: 500,
});

const ErrorAlert = styled(StyledAlert)({
  background: colors.errorBg,
  border: `1px solid ${colors.errorBorder}`,
  color: colors.errorText,
  '& .MuiAlert-icon': { color: colors.errorIcon, fontSize: '1rem' },
});

const SuccessAlert = styled(StyledAlert)({
  background: colors.statusUsingBg,
  border: `1px solid ${colors.statusUsingBorder}`,
  color: colors.statusUsingText,
  '& .MuiAlert-icon': { color: colors.statusUsingDot, fontSize: '1rem' },
});

const LabelRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '6px',
});

const LabelText = styled(Typography)({
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: colors.lightTextMid,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  fontFamily: fonts.mono,
});

const RequiredText = styled(Typography)({
  fontSize: '0.625rem',
  fontWeight: 700,
  color: colors.panelIndigo,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  fontFamily: fonts.mono,
  opacity: 0.75,
});

const PasswordIcon = styled(LockIcon)({
  fontSize: '16px',
  color: colors.lightTextLow,
});

const ConfirmPasswordIcon = styled(LockIcon, {
  shouldForwardProp: (prop) => prop !== '$error',
})<{ $error: boolean }>(({ $error }) => ({
  fontSize: '16px',
  color: $error ? colors.errorIcon : colors.lightTextLow,
}));

const ToggleButton = styled(IconButton)({
  color: colors.lightTextLow,
  marginRight: '-4px',
});

const ToggleIcon = styled(Visibility)({
  fontSize: '16px',
});

const ToggleIconOff = styled(VisibilityOff)({
  fontSize: '16px',
});

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== '$focused' && prop !== '$error',
})<InputStateProps>(({ $focused, $error }) => sharedInputStyles({ $focused, $error }));

const PasswordStrengthRoot = styled(Box)({ marginTop: '8px' });

const StrengthBars = styled(Box)({
  display: 'flex',
  gap: '4px',
  marginBottom: '8px',
});

const StrengthBar = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$active' && prop !== '$barColor',
})<StrengthBarProps>(({ $active, $barColor }) => ({
  flex: 1,
  height: '3px',
  borderRadius: '99px',
  background: $active ? $barColor : colors.lightBorder,
  transition: 'background 0.2s',
}));

const StrengthChecks = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
});

const StrengthCheckRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

const CheckDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$pass',
})<CheckStateProps>(({ $pass }) => ({
  width: 5,
  height: 5,
  borderRadius: '50%',
  flexShrink: 0,
  background: $pass ? colors.statusUsingDot : colors.lightTextLow,
  transition: 'background 0.2s',
}));

const CheckText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== '$pass',
})<CheckStateProps>(({ $pass }) => ({
  fontSize: '0.6875rem',
  fontFamily: fonts.mono,
  color: $pass ? colors.lightTextMid : colors.lightTextLow,
  transition: 'color 0.2s',
}));

const MismatchText = styled(Typography)({
  marginTop: '6px',
  fontSize: '0.6875rem',
  color: colors.errorText,
  fontFamily: fonts.mono,
});

const StyledDialogActions = styled(DialogActions)({
  paddingLeft: '24px',
  paddingRight: '24px',
  paddingBottom: '24px',
  gap: '8px',
});

const CancelButton = styled(Button)({
  color: colors.panelTextMid,
  textTransform: 'none',
  fontWeight: 500,
});

const ConfirmButton = styled(Button)({
  borderRadius: '6px',
  paddingLeft: '20px',
  paddingRight: '20px',
  paddingTop: '8px',
  paddingBottom: '8px',
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '0.8125rem',
  color: colors.white,
  background: colors.panelIndigo,
  boxShadow: `0 1px 3px rgba(0,0,0,0.12), 0 4px 12px ${colors.panelIndigoGlow}`,
  '&:hover': { background: colors.panelIndigoHover },
  '&:disabled': { background: colors.lightBorder, color: colors.lightTextLow, boxShadow: 'none' },
  transition: 'all 0.15s',
});

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains a letter', pass: /[a-zA-Z]/.test(password) },
  ];

  const strength = checks.filter((c) => c.pass).length;
  const barColor =
    strength === 1 ? colors.errorRed : strength === 2 ? colors.warningAmber : colors.statusUsingDot;

  return (
    <PasswordStrengthRoot>
      <StrengthBars>
        {[1, 2, 3].map((i) => (
          <StrengthBar key={i} $active={i <= strength} $barColor={barColor} />
        ))}
      </StrengthBars>
      <StrengthChecks>
        {checks.map((c) => (
          <StrengthCheckRow key={c.label}>
            <CheckDot $pass={c.pass} />
            <CheckText $pass={c.pass}>{c.label}</CheckText>
          </StrengthCheckRow>
        ))}
      </StrengthChecks>
    </PasswordStrengthRoot>
  );
}

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
    if (!newPassword) {
      setPasswordError('New password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
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
    <StyledDialog open={open} onClose={handleClose}>
      <StyledDialogTitle>
        Update Password
        <CloseButton
          onClick={handleClose}
          disabled={updatingPassword}
          size='small'
        >
          <CloseButtonIcon />
        </CloseButton>
      </StyledDialogTitle>

      <StyledDialogContent>
        {passwordError && <ErrorAlert severity='error'>{passwordError}</ErrorAlert>}

        {passwordSuccess && (
          <SuccessAlert severity='success'>
            Password updated successfully.
          </SuccessAlert>
        )}

        <Box>
          <LabelRow>
            <LabelText>New Password</LabelText>
            <RequiredText>required</RequiredText>
          </LabelRow>

          <StyledTextField
            fullWidth
            type={showNewPassword ? 'text' : 'password'}
            placeholder='********'
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordError('');
            }}
            onFocus={() => setPasswordFocused('new')}
            onBlur={() => setPasswordFocused(null)}
            autoComplete='new-password'
            $focused={passwordFocused === 'new'}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <PasswordIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <ToggleButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge='end'
                    disableRipple
                  >
                    {showNewPassword ? <ToggleIconOff /> : <ToggleIcon />}
                  </ToggleButton>
                </InputAdornment>
              ),
            }}
          />
          <PasswordStrength password={newPassword} />
        </Box>

        <Box>
          <LabelRow>
            <LabelText>Confirm Password</LabelText>
            <RequiredText>required</RequiredText>
          </LabelRow>

          <StyledTextField
            fullWidth
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder='********'
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordError('');
            }}
            onFocus={() => setPasswordFocused('confirm')}
            onBlur={() => setPasswordFocused(null)}
            autoComplete='new-password'
            $focused={passwordFocused === 'confirm'}
            $error={passwordMismatch}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <ConfirmPasswordIcon $error={passwordMismatch} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <ToggleButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge='end'
                    disableRipple
                  >
                    {showConfirmPassword ? <ToggleIconOff /> : <ToggleIcon />}
                  </ToggleButton>
                </InputAdornment>
              ),
            }}
          />

          {passwordMismatch && <MismatchText>Passwords do not match</MismatchText>}
        </Box>
      </StyledDialogContent>

      <StyledDialogActions>
        <CancelButton onClick={handleClose} disabled={updatingPassword}>
          Cancel
        </CancelButton>
        <ConfirmButton
          onClick={handleConfirm}
          disabled={updatingPassword || passwordMismatch || !newPassword}
        >
          {updatingPassword ? 'Updating...' : 'Update Password'}
        </ConfirmButton>
      </StyledDialogActions>
    </StyledDialog>
  );
}
