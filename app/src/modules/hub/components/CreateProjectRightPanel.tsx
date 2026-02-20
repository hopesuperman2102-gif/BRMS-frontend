'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CreateProjectRightPanelProps } from '../types/createPageTypes';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';

const { colors, fonts } = brmsTheme;

/* ─── Styled: input style factory ────────────────────────── */
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
  '& .MuiInputBase-inputMultiline': {
    fontSize: '0.875rem',
    fontFamily: fonts.mono,
    color: colors.lightTextHigh,
    lineHeight: 1.65,
    letterSpacing: '0.01em',
  },
});

/* ─── Styled Components ───────────────────────────────────── */

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

const MobileBackWrapper = styled(Box)({
  display: 'none',
  '@media (max-width: 1199px)': { display: 'flex' },
  position: 'absolute',
  top: '20px',
  left: '20px',
  zIndex: 2,
});

const MobileBackButton = styled(Button)({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.75rem',
  color: colors.panelIndigo,
  paddingLeft: 0,
  paddingRight: 0,
  minWidth: 0,
  background: 'none',
  '&:hover': {
    color: colors.panelIndigoHover,
    background: 'none',
  },
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

const CharCount = styled(Typography)<{ overlimit: boolean }>(({ overlimit }) => ({
  marginTop: '4px',
  fontSize: '0.6875rem',
  color: overlimit ? colors.errorRed : colors.lightTextLow,
  fontFamily: fonts.mono,
  textAlign: 'right',
}));

const FieldHint = styled(Typography)({
  marginTop: '6px',
  fontSize: '0.6875rem',
  color: colors.lightTextLow,
  lineHeight: 1.55,
  fontFamily: fonts.mono,
});

const Divider = styled(Box)({
  height: '1px',
  backgroundColor: colors.lightBorder,
  marginTop: '32px',
  marginBottom: '24px',
});

const ActionsWrapper = styled(Box)({
  display: 'flex',
  gap: '10px',
});

const CancelButton = styled(Button)({
  borderRadius: '6px',
  paddingTop: '10px',
  paddingBottom: '10px',
  paddingLeft: '20px',
  paddingRight: '20px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.8125rem',
  color: colors.lightTextMid,
  border: `1px solid ${colors.lightBorder}`,
  background: colors.white,
  whiteSpace: 'nowrap',
  letterSpacing: '0.01em',
  '&:hover': {
    background: colors.lightSurfaceHover,
    borderColor: colors.lightBorderHover,
    color: colors.lightTextHigh,
  },
  transition: 'all 0.15s',
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

/* ─── Label ───────────────────────────────────────────────── */

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

/* ─── Component ───────────────────────────────────────────── */

export default function CreateProjectRightPanel({
  isEditMode,
  form,
  loading,
  error,
  onFieldChange,
  onSubmit,
  onCancel,
  onBack,
}: CreateProjectRightPanelProps) {
  const [focused, setFocused] = useState<string | null>(null);

  return (
    <RightPanelRoot sx={{ px: { xs: '24px', sm: '48px', lg: '72px' } }}>

      {/* Mobile back */}
      <MobileBackWrapper>
        <MobileBackButton
          startIcon={<ArrowBackIcon sx={{ fontSize: '12px !important' }} />}
          onClick={onBack}
          disableRipple
        >
          Hub
        </MobileBackButton>
      </MobileBackWrapper>

      {/* Form card */}
      <FormCard>
        <AccentLine />

        {/* Heading block */}
        <HeadingBlock>
          <HeadingTitle>
            {isEditMode ? 'Edit project' : 'Create project'}
          </HeadingTitle>
          <HeadingSubtitle>
            {isEditMode
              ? 'Update the fields below and save your changes.'
              : 'Fill in the details below to set up your new project.'}
          </HeadingSubtitle>
        </HeadingBlock>

        {/* Error alert */}
        {error && (
          <StyledAlert severity="error">
            {error}
          </StyledAlert>
        )}

        {/* Fields */}
        <FieldsWrapper>

          {/* Project name */}
          <Box>
            <Label required>Project Name</Label>
            <TextField
              fullWidth
              placeholder="e.g. Risk Assessment Engine"
              value={form.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              onKeyDown={(e) => { if (e.key === 'Enter') void onSubmit(); }}
              sx={inputSx(focused === 'name')}
            />
          </Box>

          {/* Description */}
          <Box>
            <Label>Description</Label>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Briefly describe the purpose and goals of this project…"
              value={form.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              onFocus={() => setFocused('description')}
              onBlur={() => setFocused(null)}
              sx={inputSx(focused === 'description')}
            />
            <CharCount overlimit={form.description.length > 300}>
              {form.description.length}/300
            </CharCount>
          </Box>

          {/* Domain */}
          <Box>
            <Label>Domain</Label>
            <TextField
              fullWidth
              placeholder="e.g. finance, healthcare, retail"
              value={form.domain}
              onChange={(e) => onFieldChange('domain', e.target.value)}
              onFocus={() => setFocused('domain')}
              onBlur={() => setFocused(null)}
              sx={inputSx(focused === 'domain')}
            />
            <FieldHint>
              Categorize using the organizational domain structure
            </FieldHint>
          </Box>
        </FieldsWrapper>

        <Divider />

        {/* Actions */}
        <ActionsWrapper>
          <CancelButton onClick={onCancel} disableRipple>
            Cancel
          </CancelButton>
          <SubmitButton fullWidth disabled={loading} onClick={onSubmit} disableRipple>
            {loading ? 'Saving…' : isEditMode ? 'Save changes' : 'Create project'}
          </SubmitButton>
        </ActionsWrapper>
      </FormCard>
    </RightPanelRoot>
  );
}