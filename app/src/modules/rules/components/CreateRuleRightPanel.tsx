'use client';

import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';

const { colors, fonts } = brmsTheme;

/* ─── Input style factory ─────────────────────────────────── */
// TextField deep overrides must remain as an sx object — styled() cannot
// target MUI internal pseudo-selectors like '& .MuiOutlinedInput-root fieldset'
// reliably without the GlobalStyles API, so this is the correct pattern.
const inputSx = (focused: boolean) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: colors.white,
    transition: 'box-shadow 0.15s, border-color 0.15s',
    ...(focused && { boxShadow: `0 0 0 3px ${colors.panelIndigoGlow}` }),
    '& fieldset': {
      borderColor: focused ? colors.panelIndigo : colors.lightBorder,
      borderWidth: focused ? '1.5px' : '1px',
      transition: 'border-color 0.15s',
    },
    '&:hover fieldset': { borderColor: focused ? colors.panelIndigo : colors.lightBorderHover },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
    fontFamily: fonts.mono,
    color: colors.lightTextHigh,
    padding: '10px 14px',
    letterSpacing: '0.01em',
    '&::placeholder': { color: colors.lightTextLow, opacity: 1, fontFamily: fonts.mono },
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
const PanelRoot = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  overflow: 'auto',
  position: 'relative',
  background: colors.formBg,
  // responsive padding handled via sx on the element (breakpoints need theme)
});

const MobileBackWrapper = styled(Box)({
  display: 'flex',
  '@media (min-width: 1200px)': { display: 'none' },
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

const FormWrapper = styled(Box)({
  width: '100%',
  maxWidth: '420px',
  paddingTop: '48px',
  paddingBottom: '48px',
});

const AccentBar = styled(Box)({
  width: '32px',
  height: '2px',
  borderRadius: '1px',
  background: colors.panelIndigo,
  marginBottom: '24px',
  opacity: 0.9,
});

const FormHeadingBlock = styled(Box)({
  marginBottom: '32px',
});

const FormTitle = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 800,
  color: colors.lightTextHigh,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  marginBottom: '8px',
});

const FormSubtitle = styled(Typography)({
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

const FieldsStack = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

const FieldBlock = styled(Box)({});

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

const RequiredBadge = styled(Typography)({
  fontSize: '0.625rem',
  fontWeight: 700,
  color: colors.panelIndigo,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  fontFamily: fonts.mono,
  opacity: 0.75,
});

const CharCount = styled(Typography)<{ overlimit?: boolean }>(({ overlimit }) => ({
  marginTop: '4px',
  fontSize: '0.6875rem',
  color: overlimit ? colors.errorRed : colors.lightTextLow,
  fontFamily: fonts.mono,
  textAlign: 'right',
}));

const LocationBox = styled(Box)({
  borderRadius: '6px',
  border: `1px solid ${colors.lightBorder}`,
  background: colors.white,
  padding: '12px 14px',
});

const LocationName = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: colors.lightTextHigh,
  marginBottom: '6px',
  letterSpacing: '-0.01em',
});

const LocationPath = styled(Typography)({
  fontSize: '0.6875rem',
  color: colors.lightTextLow,
  fontFamily: fonts.mono,
  letterSpacing: '0.02em',
});

const Divider = styled(Box)({
  height: '1px',
  backgroundColor: colors.lightBorder,
  marginTop: '32px',
  marginBottom: '24px',
});

const ActionRow = styled(Box)({
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
  flex: 1,
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
    boxShadow: '0 1px 3px rgba(0,0,0,0.16), 0 6px 20px rgba(79,70,229,0.28)',
    transform: 'translateY(-1px)',
  },
  '&.Mui-disabled': {
    background: colors.lightBorder,
    color: colors.lightTextLow,
    boxShadow: 'none',
    transform: 'none',
  },
  transition: 'all 0.15s',
});

/* ─── Label sub-component ─────────────────────────────────── */
const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <LabelRow>
    <LabelText>{children}</LabelText>
    {required && <RequiredBadge>required</RequiredBadge>}
  </LabelRow>
);

/* ─── Types ───────────────────────────────────────────────── */
type FormState = { name: string; description: string; directory: string };

/* ─── Props ───────────────────────────────────────────────── */
interface CreateRuleRightPanelProps {
  isEditMode: boolean;
  form: FormState;
  loading: boolean;
  error: string | null;
  focused: string | null;
  locationLabel: string;
  onFormChange: (field: keyof FormState, value: string) => void;
  onFocus: (field: string) => void;
  onBlur: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  onBack: () => void;
}

/* ─── Component ───────────────────────────────────────────── */
export default function CreateRuleRightPanel({
  isEditMode,
  form,
  loading,
  error,
  focused,
  locationLabel,
  onFormChange,
  onFocus,
  onBlur,
  onSubmit,
  onCancel,
  onBack,
}: CreateRuleRightPanelProps) {
  return (
    <PanelRoot sx={{ px: { xs: '24px', sm: '48px', lg: '72px' } }}>

      {/* Mobile back */}
      <MobileBackWrapper>
        <MobileBackButton
          startIcon={<ArrowBackIcon sx={{ fontSize: '12px !important' }} />}
          onClick={onBack}
          disableRipple
        >
          Rules
        </MobileBackButton>
      </MobileBackWrapper>

      {/* Form */}
      <FormWrapper>
        <AccentBar />

        <FormHeadingBlock>
          <FormTitle>{isEditMode ? 'Edit rule' : 'Create rule'}</FormTitle>
          <FormSubtitle>
            {isEditMode
              ? 'Update the fields below and save your changes.'
              : 'Fill in the details below to define your new rule.'}
          </FormSubtitle>
        </FormHeadingBlock>

        {error && <StyledAlert severity="error">{error}</StyledAlert>}

        <FieldsStack>

          {/* Rule name */}
          <FieldBlock>
            <Label required>Rule Name</Label>
            <TextField
              fullWidth
              placeholder="e.g. Eligibility Check"
              value={form.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              onFocus={() => onFocus('name')}
              onBlur={onBlur}
              onKeyDown={(e) => { if (e.key === 'Enter') void onSubmit(); }}
              sx={inputSx(focused === 'name')}
            />
          </FieldBlock>

          {/* Description */}
          <FieldBlock>
            <Label>Description</Label>
            <TextField
              fullWidth multiline rows={3}
              placeholder="Describe what this rule evaluates or decides…"
              value={form.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              onFocus={() => onFocus('description')}
              onBlur={onBlur}
              sx={inputSx(focused === 'description')}
            />
            <CharCount overlimit={form.description.length > 300}>
              {form.description.length}/300
            </CharCount>
          </FieldBlock>

          {/* Location — read-only */}
          <FieldBlock>
            <Label>Location</Label>
            <LocationBox>
              <LocationName>{locationLabel}</LocationName>
              <LocationPath>
                Full path : {form.directory}/{form.name || '[rule-name]'}
              </LocationPath>
            </LocationBox>
          </FieldBlock>

        </FieldsStack>

        <Divider />

        <ActionRow>
          <CancelButton disableRipple onClick={onCancel}>
            Cancel
          </CancelButton>
          <SubmitButton disableRipple disabled={loading} onClick={onSubmit}>
            {loading ? 'Saving…' : isEditMode ? 'Save changes' : 'Create rule'}
          </SubmitButton>
        </ActionRow>
      </FormWrapper>
    </PanelRoot>
  );
}