'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import { brmsTheme } from '@/core/theme/brmsTheme';
import RcInputField from '@/core/components/RcInputField';
import RcEmail from '@/core/components/RcEmail';
import RcPasswordField from '@/core/components/RcPasswordField';
import { Checkbox, FormControlLabel } from '@mui/material';
import { Email } from '@mui/icons-material';
import { LoginRightPanelProps } from '@/modules/auth/types/loginTypes';

const { colors, fonts } = brmsTheme;
 
const inputSx = (focused: boolean) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: colors.white,
    transition: 'box-shadow 0.15s, border-color 0.15s',
    ...(focused && {
      boxShadow: `0 0 0 3px ${colors.panelIndigoGlow}`,
    }),
    '& fieldset': {
      borderColor: focused ? colors.panelIndigo : colors.lightBorder,
      borderWidth: focused ? '1.5px' : '1px',
      transition: 'border-color 0.15s',
    },
    '&:hover fieldset': {
      borderColor: focused ? colors.panelIndigo : colors.lightBorderHover,
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
  background: colors.errorBg,
  border: `1px solid ${colors.errorBorder}`,
  color: colors.errorText,
  fontSize: '0.8125rem',
  fontWeight: 500,
  '& .MuiAlert-icon': {
    color: colors.errorIcon,
    fontSize: '1rem',
  },
});
 
const FieldsWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});
 
const Divider = styled(Box)({
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
 
export default function LoginRightPanel({
  formData,
  loading,
  loginMode,
  setLoginMode,
  error,
  onChange,
  onSubmit,
}: LoginRightPanelProps) {
  const [focused, setFocused] = useState<string | null>(null);
 
  return (
    <RightPanelRoot sx={{ px: { xs: '24px', sm: '48px', lg: '72px' } }}>
      <FormCard>
        <AccentLine />
 
        <HeadingBlock>
          <HeadingTitle>Sign in</HeadingTitle>
          <HeadingSubtitle>
            Enter your credentials to access your workspace.
          </HeadingSubtitle>
        </HeadingBlock>
 
        {error && (
          <StyledAlert severity="error">{error}</StyledAlert>
        )}
 
        <Box component="form" onSubmit={onSubmit}>
          <FieldsWrapper>
 
            {/* Username OR Email */}
            <Box>
              <Label required>
    {loginMode === 'username' ? 'Username' : 'Email'}
  </Label>
{loginMode === 'username' ? (
  <RcInputField
    name="username"
    value={formData.username}
    onChange={onChange}
    onFocus={() => setFocused('username')}
    onBlur={() => setFocused(null)}
    placeholder="your username"
    autoComplete="username"
    maxLength={30}
    startIcon={
      <PersonIcon
        sx={{ fontSize: '16px', color: colors.lightTextLow }}
      />
    }
    sx={inputSx(focused === 'username')}
  />
) : (
  <RcEmail
  name="emailid"
  value={formData.emailid}
  onChange={onChange}
  required
  autoComplete='email'
  onFocus={() => setFocused('email')}
  onBlur={() => setFocused(null)}
  startIcon={<Email sx={{ fontSize: '16px', color: colors.lightTextLow }} />}
  sx={inputSx(focused === 'email')}
/>
 
)}
</Box>
 
            {/* Password */}
            <Box>
              <Label required>Password</Label>
              <RcPasswordField
                name="password"
                value={formData.password}
                onChange={onChange}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                autoComplete="current-password"
                maxLength={30}
                startIcon={<LockIcon sx={{ fontSize: '16px', color: colors.lightTextLow }} />}
                sx={inputSx(focused === 'password')}
              />
            </Box>
 
          </FieldsWrapper>
 
          {/*  */}
          <Box
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mt: '10px',
  }}
>
  <FormControlLabel
    control={
      <Checkbox
        checked={loginMode === 'email'}
        onChange={(e) => setLoginMode(e.target.checked ? 'email' : 'username')}
        size="small"
        sx={{
          color: colors.lightBorder,
          '&.Mui-checked': { color: colors.panelIndigo },
          padding: '4px',
          mr: '4px',
        }}
      />
    }
    label={
      <Typography sx={{
        fontSize: '0.6875rem',
        fontFamily: fonts.mono,
        color: colors.lightTextMid,
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}>
        Sign In with Email
      </Typography>
    }
  />
  <Typography
    component={Link}
    to="/forgot-password"
    sx={{
      fontSize: '0.6875rem',
      fontFamily: fonts.mono,
      color: colors.panelIndigo,
      textDecoration: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
      '&:hover': { textDecoration: 'underline' },
    }}
  >
    Forgot password?
  </Typography>
</Box>
 
          <Divider />
 
          <SubmitButton fullWidth type="submit" disabled={loading} disableRipple>
            {loading ? 'Signing in…' : 'Sign In'}
          </SubmitButton>
        </Box>
      </FormCard>
    </RightPanelRoot>
  );
}