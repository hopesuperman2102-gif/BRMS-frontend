import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RcDropdown from '@/core/components/RcDropdown';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { LogsToolbarProps } from '../types/auditLogsTypes';

const { colors, fonts } = brmsTheme;
const MotionBox = motion(Box);

const ToolbarRoot = styled(MotionBox)({
  marginBottom: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const LeftGroup = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

const BackButton = styled(IconButton)({
  width: 34,
  height: 34,
  borderRadius: 8,
  background: colors.white,
  border: `1px solid ${colors.lightBorder}`,
  color: colors.lightTextMid,
  transition: 'all 0.15s',
  '&:hover': {
    background: colors.primaryGlowSoft,
    color: colors.primary,
    borderColor: colors.primaryGlowMid,
  },
});

const CrumbRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 5,
});

const CrumbText = styled(Typography)({
  fontSize: 12,
  color: colors.lightTextLow,
  fontFamily: fonts.mono,
});

const CrumbSlash = styled(Typography)({
  fontSize: 12,
  color: colors.lightTextLow,
  fontFamily: fonts.sans,
});

const CrumbStrong = styled(Typography)({
  fontSize: 13,
  fontWeight: 700,
  color: colors.lightTextHigh,
  fontFamily: fonts.mono,
});

const LivePill = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 10px',
  borderRadius: 6,
  background: colors.approvedBg,
  border: `1px solid ${colors.approvedBorder}`,
});

const LiveDot = styled(Box)({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: colors.approvedText,
  animation: 'blink 2s ease-in-out infinite',
  '@keyframes blink': {
    '0%,100%': { opacity: 1 },
    '50%': { opacity: 0.3 },
  },
});

const LiveText = styled(Typography)({
  fontSize: 10,
  fontWeight: 700,
  color: colors.approvedText,
  letterSpacing: '0.07em',
  fontFamily: fonts.mono,
});

const StyledArrowBackIcon = styled(ArrowBackIcon)({ fontSize: 18 });
const StyledCalendarTodayIcon = styled(CalendarTodayIcon)({
  fontSize: 15,
  color: colors.primary,
});

export default function LogsToolbar({
  dayDropdownItems,
  selectedDay,
  onDaySelect,
  onBack,
}: LogsToolbarProps) {
  return (
    <ToolbarRoot
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <LeftGroup>
        <BackButton onClick={onBack}>
          <StyledArrowBackIcon />
        </BackButton>

        <CrumbRow>
          <CrumbText>monitoring</CrumbText>
          <CrumbSlash>/</CrumbSlash>
          <CrumbStrong>system-logs</CrumbStrong>
        </CrumbRow>

        <LivePill>
          <LiveDot />
          <LiveText>LIVE</LiveText>
        </LivePill>
      </LeftGroup>

      {dayDropdownItems.length > 0 && (
        <RcDropdown
          label='Select Day'
          items={dayDropdownItems}
          value={selectedDay ?? undefined}
          onSelect={onDaySelect}
          startIcon={<StyledCalendarTodayIcon />}
        />
      )}
    </ToolbarRoot>
  );
}
