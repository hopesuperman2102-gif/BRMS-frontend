"use client";

import { useState, type ReactNode } from "react";
import { Box, Typography, Button, Alert } from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { brmsTheme } from "@/core/theme/brmsTheme";
import RcDropdown from "@/core/components/RcDropdown";
import RcEmail from "@/core/components/RcEmail";
import EmailIcon from "@mui/icons-material/Email";
import RcInputField from "@/core/components/RcInputField";
import RcPasswordField from "@/core/components/RcPasswordField";
import { CreateUserRightPanelProps } from "@/modules/UserLifecycle/types/userTypes";

const { colors, fonts } = brmsTheme;

type InputStateProps = {
  $focused: boolean;
  $error?: boolean;
};

type StrengthBarProps = {
  $active: boolean;
  $barColor: string;
};

type CheckDotProps = {
  $pass: boolean;
};

const sharedInputStyles = ({ $focused, $error }: InputStateProps) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    backgroundColor: colors.white,
    transition: "box-shadow 0.15s, border-color 0.15s",
    ...($focused &&
      !$error && { boxShadow: `0 0 0 3px ${colors.panelIndigoGlow}` }),
    ...($error && { boxShadow: "0 0 0 3px rgba(239,68,68,0.12)" }),
    "& fieldset": {
      borderColor: $error
        ? colors.errorBorder
        : $focused
          ? colors.panelIndigo
          : colors.lightBorder,
      borderWidth: $focused || $error ? "1.5px" : "1px",
      transition: "border-color 0.15s",
    },
    "&:hover fieldset": {
      borderColor: $error
        ? colors.errorBorder
        : $focused
          ? colors.panelIndigo
          : colors.lightBorderHover,
    },
  },
  "& .MuiInputBase-input": {
    fontSize: "0.875rem",
    fontFamily: fonts.mono,
    color: colors.lightTextHigh,
    padding: "10px 14px",
    letterSpacing: "0.01em",
    "&::placeholder": {
      color: colors.lightTextLow,
      opacity: 1,
      fontFamily: fonts.mono,
    },
  },
});

const RightPanelRoot = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  overflow: "auto",
  position: "relative",
  background: colors.formBg,
  paddingLeft: "24px",
  paddingRight: "24px",
  [theme.breakpoints.up("sm")]: {
    paddingLeft: "48px",
    paddingRight: "48px",
  },
  [theme.breakpoints.up("lg")]: {
    paddingLeft: "72px",
    paddingRight: "72px",
  },
}));

const FormCard = styled(Box)({
  width: "100%",
  maxWidth: "420px",
  paddingTop: "48px",
  paddingBottom: "48px",
});

const AccentLine = styled(Box)({
  width: "32px",
  height: "2px",
  borderRadius: "1px",
  background: colors.panelIndigo,
  marginBottom: "24px",
  opacity: 0.9,
});

const HeadingBlock = styled(Box)({ marginBottom: "32px" });

const HeadingTitle = styled(Typography)({
  fontSize: "1.5rem",
  fontWeight: 800,
  color: colors.lightTextHigh,
  letterSpacing: "-0.03em",
  lineHeight: 1.1,
  marginBottom: "8px",
});

const HeadingSubtitle = styled(Typography)({
  fontSize: "0.8125rem",
  color: colors.lightTextMid,
  fontWeight: 400,
  lineHeight: 1.65,
});

const StyledAlert = styled(Alert)({
  marginBottom: "24px",
  borderRadius: "6px",
  paddingTop: "6px",
  paddingBottom: "6px",
  fontSize: "0.8125rem",
  fontWeight: 500,
});

const SuccessAlert = styled(StyledAlert)({
  background: colors.statusUsingBg,
  border: `1px solid ${colors.statusUsingBorder}`,
  color: colors.statusUsingText,
  "& .MuiAlert-icon": { color: colors.statusUsingDot, fontSize: "1rem" },
});

const FormElement = styled("form")({});

const FieldsWrapper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
});

const FormDivider = styled(Box)({
  height: "1px",
  backgroundColor: colors.lightBorder,
  marginTop: "32px",
  marginBottom: "24px",
});

const SubmitButton = styled(Button)({
  borderRadius: "6px",
  paddingTop: "10px",
  paddingBottom: "10px",
  textTransform: "none",
  fontWeight: 700,
  fontSize: "0.8125rem",
  color: colors.white,
  letterSpacing: "0.01em",
  background: colors.panelIndigo,
  boxShadow: `0 1px 3px rgba(0,0,0,0.12), 0 4px 12px ${colors.panelIndigoGlow}`,
  "&:hover": {
    background: colors.panelIndigoHover,
    boxShadow: "0 1px 3px rgba(0,0,0,0.16), 0 6px 20px rgba(79,70,229,0.28)",
    transform: "translateY(-1px)",
  },
  "&:disabled": {
    background: colors.lightBorder,
    color: colors.lightTextLow,
    boxShadow: "none",
    transform: "none",
  },
  transition: "all 0.15s",
});

const LabelWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "6px",
});

const LabelText = styled(Typography)({
  fontSize: "0.6875rem",
  fontWeight: 600,
  color: colors.lightTextMid,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontFamily: fonts.mono,
});

const RequiredBadge = styled(Typography)({
  fontSize: "0.625rem",
  fontWeight: 700,
  color: colors.panelIndigo,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  fontFamily: fonts.mono,
  opacity: 0.75,
});

const PasswordStrengthRoot = styled(Box)({ marginTop: "8px" });

const StrengthBars = styled(Box)({
  display: "flex",
  gap: "4px",
  marginBottom: "8px",
});

const StrengthBar = styled(Box, {
  shouldForwardProp: (prop) => prop !== "$active" && prop !== "$barColor",
})<StrengthBarProps>(({ $active, $barColor }) => ({
  flex: 1,
  height: "3px",
  borderRadius: "99px",
  background: $active ? $barColor : colors.lightBorder,
  transition: "background 0.2s",
}));

const StrengthChecks = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "3px",
});

const StrengthCheckRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "6px",
});

const CheckDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "$pass",
})<CheckDotProps>(({ $pass }) => ({
  width: 5,
  height: 5,
  borderRadius: "50%",
  flexShrink: 0,
  background: $pass ? colors.statusUsingDot : colors.lightTextLow,
  transition: "background 0.2s",
}));

const CheckText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "$pass",
})<CheckDotProps>(({ $pass }) => ({
  fontSize: "0.6875rem",
  fontFamily: fonts.mono,
  color: $pass ? colors.lightTextMid : colors.lightTextLow,
  transition: "color 0.2s",
}));

const FieldIcon = styled(PersonIcon)({
  fontSize: "16px",
  color: colors.lightTextLow,
});

const EmailFieldIcon = styled(EmailIcon)({
  fontSize: "16px",
  color: colors.lightTextLow,
});

const PasswordFieldIcon = styled(LockIcon)({
  fontSize: "16px",
  color: colors.lightTextLow,
});

const ConfirmPasswordIcon = styled(LockIcon, {
  shouldForwardProp: (prop) => prop !== "$error",
})<{ $error: boolean }>(({ $error }) => ({
  fontSize: "16px",
  color: $error ? colors.errorIcon : colors.lightTextLow,
}));

const MismatchText = styled(Typography)({
  marginTop: "6px",
  fontSize: "0.6875rem",
  color: colors.errorText,
  fontFamily: fonts.mono,
});

const StyledRcInputField = styled(RcInputField, {
  shouldForwardProp: (prop) => prop !== "$focused" && prop !== "$error",
})<InputStateProps>(({ $focused, $error }) => sharedInputStyles({ $focused, $error }));

const StyledRcEmail = styled(RcEmail, {
  shouldForwardProp: (prop) => prop !== "$focused" && prop !== "$error",
})<InputStateProps>(({ $focused, $error }) => sharedInputStyles({ $focused, $error }));

const StyledRcPasswordField = styled(RcPasswordField, {
  shouldForwardProp: (prop) => prop !== "$focused" && prop !== "$error",
})<InputStateProps>(({ $focused, $error }) => sharedInputStyles({ $focused, $error }));

const Label = ({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) => (
  <LabelWrapper>
    <LabelText>{children}</LabelText>
    {required && <RequiredBadge>required</RequiredBadge>}
  </LabelWrapper>
);

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Contains a number", pass: /\d/.test(password) },
    { label: "Contains a letter", pass: /[a-zA-Z]/.test(password) },
  ];

  const strength = checks.filter((c) => c.pass).length;
  const barColor =
    strength === 1
      ? colors.errorRed
      : strength === 2
        ? colors.warningAmber
        : colors.statusUsingDot;

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

export default function CreateUserRightPanel({
  formData,
  loading,
  success,
  onChange,
  onRoleSelect,
  onSubmit,
  resetKey,
}: CreateUserRightPanelProps) {
  const [focused, setFocused] = useState<string | null>(null);

  const passwordMismatch =
    !!formData.confirmPassword &&
    formData.password !== formData.confirmPassword;

  const roleOptions = [
    { label: "Viewer", value: "VIEWER" },
    { label: "Reviewer", value: "REVIEWER" },
    { label: "Rule Author", value: "RULE_AUTHOR" },
    { label: "Super Admin", value: "SUPER_ADMIN" },
  ];

  return (
    <RightPanelRoot>
      <FormCard>
        <AccentLine />

        <HeadingBlock>
          <HeadingTitle>Onboard User</HeadingTitle>
          <HeadingSubtitle>
            Set a username and password for the new team member.
          </HeadingSubtitle>
        </HeadingBlock>

        {success && (
          <SuccessAlert
            severity="success"
            icon={<CheckCircleOutlineIcon fontSize="small" />}
          >
            User created successfully.
          </SuccessAlert>
        )}

        <FormElement onSubmit={onSubmit} noValidate>
          <FieldsWrapper>
            <Box>
              <Label required>Username</Label>
              <StyledRcInputField
                name="username"
                placeholder="e.g. john.doe"
                value={formData.username}
                onChange={onChange}
                onFocus={() => setFocused("username")}
                onBlur={() => setFocused(null)}
                autoComplete="off"
                maxLength={30}
                startIcon={<FieldIcon />}
                $focused={focused === "username"}
              />
            </Box>

            <Box>
              <Label required>Email</Label>
              <StyledRcEmail
                name="email"
                value={formData.email}
                onChange={onChange}
                required
                autoComplete="email"
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                startIcon={<EmailFieldIcon />}
                $focused={focused === "email"}
                resetKey={resetKey}
              />
            </Box>

            <Box>
              <Label required>Password</Label>
              <StyledRcPasswordField
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={onChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                autoComplete="new-password"
                maxLength={30}
                startIcon={<PasswordFieldIcon />}
                $focused={focused === "password"}
              />
              <PasswordStrength password={formData.password} />
            </Box>

            <Box>
              <Label required>Confirm password</Label>
              <StyledRcPasswordField
                name="confirmPassword"
                placeholder="********"
                value={formData.confirmPassword}
                onChange={onChange}
                onFocus={() => setFocused("confirmPassword")}
                onBlur={() => setFocused(null)}
                autoComplete="new-password"
                maxLength={128}
                startIcon={<ConfirmPasswordIcon $error={passwordMismatch} />}
                $focused={focused === "confirmPassword"}
                $error={passwordMismatch}
              />
              {passwordMismatch && <MismatchText>Passwords do not match</MismatchText>}
            </Box>

            <Box>
              <Label required>Role</Label>
              <RcDropdown
                label="Select Role"
                startIcon={<FieldIcon />}
                items={roleOptions}
                value={formData.roles[0] || null}
                onSelect={onRoleSelect}
                fullWidth={true}
              />
            </Box>
          </FieldsWrapper>

          <FormDivider />

          <SubmitButton
            fullWidth
            type="submit"
            disabled={loading || passwordMismatch || !formData.roles.length}
            disableRipple
          >
            {loading ? "Creating user..." : "Create User"}
          </SubmitButton>
        </FormElement>
      </FormCard>
    </RightPanelRoot>
  );
}
