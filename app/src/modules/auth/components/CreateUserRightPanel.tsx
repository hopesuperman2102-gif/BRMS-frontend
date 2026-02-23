'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { brmsTheme } from '../../../core/theme/brmsTheme';

const { colors, fonts } = brmsTheme;

/* ─── Input style factory (identical to LoginRightPanel) ──── */
const inputSx = (focused: boolean, error?: boolean) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: colors.white,
    transition: 'box-shadow 0.15s, border-color 0.15s',
    ...(focused && !error && {
      boxShadow: `0 0 0 3px ${colors.panelIndigoGlow}`,
    }),
    ...(error && {
      boxShadow: `0 0 0 3px rgba(239,68,68,0.12)`,
    }),
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

/* ─── Styled Components (mirrors LoginRightPanel) ──────────── */

const RightPanelRoot = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  overflow: 'auto',
  position: 'relative',
  background: colors.formBg,
});

const FormCard = styled(Box)({
  width: '100%',
  maxWidth: '420px',
  paddingTop: '48px',
  paddingBottom: '48px',
});

const AccentLine = styled(Box)({
  width: '32px',
  height: '2px',
  borderRadius: '1px',
  background: colors.panelIndigo,
  marginBottom: '24px',
  opacity: 0.9,
});

const HeadingBlock = styled(Box)({
  marginBottom: '32px',
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

const StyledAlert = styled(Alert)({
  marginBottom: '24px',
  borderRadius: '6px',
  paddingTop: '6px',
  paddingBottom: '6px',
  fontSize: '0.8125rem',
  fontWeight: 500,
});

const FieldsWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

const FormDivider = styled(Box)({
  height: '1px',
  backgroundColor: colors.lightBorder,
  marginTop: '32px',
  marginBottom: '24px',
});

const SubmitButton = styled(Button)({
  borderRadius: '6px',
  paddingTop: '10px',
  paddingBottom: '10px',
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '0.8125rem',
  color: colors.white,
  letterSpacing: '0.01em',
  background: colors.panelIndigo,
  boxShadow: `0 1px 3px rgba(0,0,0,0.12), 0 4px 12px ${colors.panelIndigoGlow}`,
  '&:hover': {
    background: colors.panelIndigoHover,
    boxShadow: `0 1px 3px rgba(0,0,0,0.16), 0 6px 20px rgba(79,70,229,0.28)`,
    transform: 'translateY(-1px)',
  },
  '&:disabled': {
    background: colors.lightBorder,
    color: colors.lightTextLow,
    boxShadow: 'none',
    transform: 'none',
  },
  transition: 'all 0.15s',
});

/* ─── Label (identical to LoginRightPanel) ─────────────────── */

const LabelWrapper = styled(Box)({
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

const RequiredBadge = styled(Typography)({
  fontSize: '0.625rem',
  fontWeight: 700,
  color: colors.panelIndigo,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  fontFamily: fonts.mono,
  opacity: 0.75,
});

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <LabelWrapper>
    <LabelText>{children}</LabelText>
    {required && <RequiredBadge>required</RequiredBadge>}
  </LabelWrapper>
);

/* ─── Password strength indicator ──────────────────────────── */

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains a letter', pass: /[a-zA-Z]/.test(password) },
  ];

  const strength = checks.filter(c => c.pass).length;
  const barColor = strength === 1 ? '#ef4444' : strength === 2 ? '#ed6c02' : '#22c55e';
  const barLabel = strength === 1 ? 'Weak' : strength === 2 ? 'Fair' : 'Strong';

  return (
    <Box sx={{ mt: 1 }}>
      {/* Strength bar */}
      <Box sx={{ display: 'flex', gap: '4px', mb: '8px' }}>
        {[1, 2, 3].map(i => (
          <Box
            key={i}
            sx={{
              flex: 1, height: '3px', borderRadius: '99px',
              background: i <= strength ? barColor : colors.lightBorder,
              transition: 'background 0.2s',
            }}
          />
        ))}
      </Box>
      {/* Check list */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {checks.map(c => (
          <Box key={c.label} sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Box sx={{
              width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
              background: c.pass ? '#22c55e' : colors.lightTextLow,
              transition: 'background 0.2s',
            }} />
            <Typography sx={{ fontSize: '0.6875rem', fontFamily: fonts.mono, color: c.pass ? colors.lightTextMid : colors.lightTextLow, transition: 'color 0.2s' }}>
              {c.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ─── Props ─────────────────────────────────────────────────── */

export interface CreateUserFormData {
  username: string;
  password: string;
  confirmPassword: string;
}

interface CreateUserRightPanelProps {
  formData: CreateUserFormData;
  loading: boolean;
  error: string;
  success: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/* ─── Component ─────────────────────────────────────────────── */

export default function CreateUserRightPanel({
  formData,
  loading,
  error,
  success,
  onChange,
  onSubmit,
}: CreateUserRightPanelProps) {
  const [focused, setFocused] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordMismatch =
    !!formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <RightPanelRoot sx={{ px: { xs: '24px', sm: '48px', lg: '72px' } }}>
      <FormCard>
        <AccentLine />

        <HeadingBlock>
          <HeadingTitle>Onboard User</HeadingTitle>
          <HeadingSubtitle>
            Set a username and password for the new team member.
          </HeadingSubtitle>
        </HeadingBlock>

        {/* Error */}
        {error && (
          <StyledAlert
            severity="error"
            sx={{
              background: colors.errorBg,
              border: `1px solid ${colors.errorBorder}`,
              color: colors.errorText,
              '& .MuiAlert-icon': { color: colors.errorIcon, fontSize: '1rem' },
            }}
          >
            {error}
          </StyledAlert>
        )}

        {/* Success */}
        {success && (
          <StyledAlert
            severity="success"
            icon={<CheckCircleOutlineIcon fontSize="small" />}
            sx={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#166534',
              '& .MuiAlert-icon': { color: '#22c55e', fontSize: '1rem' },
            }}
          >
            User created successfully.
          </StyledAlert>
        )}

        <Box component="form" onSubmit={onSubmit} noValidate>
          <FieldsWrapper>

            {/* Username */}
            <Box>
              <Label required>Username</Label>
              <TextField
                fullWidth
                name="username"
                placeholder="e.g. john.doe"
                value={formData.username}
                onChange={onChange}
                onFocus={() => setFocused('username')}
                onBlur={() => setFocused(null)}
                autoComplete="off"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ fontSize: '16px', color: colors.lightTextLow }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx(focused === 'username')}
              />
            </Box>

            {/* Password */}
            <Box>
              <Label required>Password</Label>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={onChange}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                autoComplete="new-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ fontSize: '16px', color: colors.lightTextLow }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disableRipple
                        sx={{ color: colors.lightTextLow, mr: '-4px' }}
                      >
                        {showPassword
                          ? <VisibilityOff sx={{ fontSize: '16px' }} />
                          : <Visibility sx={{ fontSize: '16px' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputSx(focused === 'password')}
              />
              {/* Strength indicator — only shown while typing */}
              <PasswordStrength password={formData.password} />
            </Box>

            {/* Confirm Password */}
            <Box>
              <Label required>Confirm password</Label>
              <TextField
                fullWidth
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={onChange}
                onFocus={() => setFocused('confirmPassword')}
                onBlur={() => setFocused(null)}
                autoComplete="new-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ fontSize: '16px', color: passwordMismatch ? colors.errorIcon : colors.lightTextLow }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm(!showConfirm)}
                        edge="end"
                        disableRipple
                        sx={{ color: colors.lightTextLow, mr: '-4px' }}
                      >
                        {showConfirm
                          ? <VisibilityOff sx={{ fontSize: '16px' }} />
                          : <Visibility sx={{ fontSize: '16px' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputSx(focused === 'confirmPassword', passwordMismatch)}
              />
              {/* Inline mismatch hint */}
              {passwordMismatch && (
                <Typography sx={{ mt: '6px', fontSize: '0.6875rem', color: colors.errorText, fontFamily: fonts.mono }}>
                  Passwords do not match
                </Typography>
              )}
            </Box>

          </FieldsWrapper>

          <FormDivider />

          <SubmitButton
            fullWidth
            type="submit"
            disabled={loading || passwordMismatch}
            disableRipple
          >
            {loading ? 'Creating user…' : 'Create User'}
          </SubmitButton>
        </Box>
      </FormCard>
    </RightPanelRoot>
  );
}