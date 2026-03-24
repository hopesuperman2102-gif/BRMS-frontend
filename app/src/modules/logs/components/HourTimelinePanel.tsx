import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AnimatePresence, motion } from 'framer-motion';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { HourTimelinePanelProps } from '../types/auditLogsTypes';

const { colors, fonts, gradients, shadows } = brmsTheme;
const MotionBox = motion(Box);

const PanelRoot = styled(MotionBox)({
  background: colors.white,
  border: `1px solid ${colors.lightBorder}`,
  borderRadius: 10,
  overflow: 'hidden',
});

const PanelHeaderRow = styled(Box)({
  padding: '9px 16px',
  borderBottom: `1px solid ${colors.lightBorder}`,
  background: colors.surfaceBase,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const HeaderTitle = styled(Typography)({
  fontSize: 10,
  fontWeight: 700,
  color: colors.lightTextMid,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontFamily: fonts.mono,
});

const HeaderRight = styled(Typography)({
  fontSize: 10,
  color: colors.lightTextLow,
  fontFamily: fonts.mono,
});

const ChartBlock = styled(Box)({
  padding: '16px 16px 0',
});

const ChartRow = styled(Box)({
  display: 'flex',
  alignItems: 'flex-end',
  gap: 2,
  height: 52,
});

const VolumeBar = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'barheight' && prop !== 'active',
})<{ barheight: string; active: boolean }>(({ barheight, active }) => ({
  flex: 1,
  borderRadius: '2px 2px 0 0',
  height: barheight,
  background: active ? colors.primary : colors.panelIndigoMuted,
  transition: 'all 0.2s',
  cursor: 'default',
  '&:hover': { background: colors.panelIndigoTint15 },
}));

const AxisRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 4,
  marginBottom: 8,
});

const AxisText = styled(Typography)({
  fontSize: 9,
  color: colors.lightTextLow,
  fontFamily: fonts.mono,
});

const BadgeSection = styled(Box)({
  padding: '12px 16px 16px',
  borderTop: `1px solid ${colors.lightBorder}`,
});

const BadgeList = styled(MotionBox)({
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
});

const EmptyText = styled(Typography)({
  fontSize: 12,
  color: colors.lightTextLow,
  fontFamily: fonts.mono,
});

const HourCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ active }) => ({
  padding: '9px 12px',
  borderRadius: 8,
  cursor: 'pointer',
  background: active ? gradients.primary : colors.white,
  border: `1px solid ${active ? colors.primary : colors.lightBorder}`,
  boxShadow: active ? shadows.primarySoft : 'none',
  transition: 'all 0.15s',
  textAlign: 'center',
  minWidth: 60,
  '&:hover': !active ? { borderColor: colors.lightBorderHover, background: colors.lightSurfaceHover } : {},
}));

const HourText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ active }) => ({
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1,
  color: active ? colors.textOnPrimary : colors.lightTextHigh,
  fontFamily: fonts.mono,
}));

const TimeText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ active }) => ({
  fontSize: 9,
  marginTop: 3,
  color: active ? colors.panelTextMid : colors.lightTextLow,
  fontFamily: fonts.mono,
}));

function Panel({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <PanelRoot
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </PanelRoot>
  );
}

function HourBadge({
  fileKey,
  createdAt,
  active,
  onClick,
}: {
  fileKey: string;
  createdAt: string;
  active: boolean;
  onClick: () => void;
}) {
  const hour = fileKey.split('-').pop() + ':00';
  const time = createdAt
    ? new Date(createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
      <HourCard active={active} onClick={onClick}>
        <HourText active={active}>{hour}</HourText>
        {time ? <TimeText active={active}>{time}</TimeText> : null}
      </HourCard>
    </motion.div>
  );
}

export default function HourTimelinePanel({
  selectedDay,
  selectedFile,
  dayEntries,
  chartEntries,
  onHourSelect,
  formatDateLabel,
}: HourTimelinePanelProps) {
  const max = Math.max(...chartEntries.map((entry) => entry.total), 1);

  return (
    <Panel delay={0.05}>
      <PanelHeaderRow>
        <HeaderTitle>Hour Timeline</HeaderTitle>
        {selectedDay ? <HeaderRight>{formatDateLabel(selectedDay)}</HeaderRight> : null}
      </PanelHeaderRow>

      <ChartBlock>
        <ChartRow>
          {chartEntries.map((entry, index) => {
            const pct = (entry.total / max) * 100;
            return (
              <VolumeBar
                key={index}
                title={`${entry.file_key.split('-').pop()}:00`}
                barheight={`${Math.max(pct, 5)}%`}
                active={entry.file_key === selectedFile}
              />
            );
          })}
        </ChartRow>
        <AxisRow>
          <AxisText>{chartEntries[0]?.file_key.split('-').pop()}:00</AxisText>
          <AxisText>{chartEntries.slice(-1)[0]?.file_key.split('-').pop()}:00</AxisText>
        </AxisRow>
      </ChartBlock>

      <BadgeSection>
        <AnimatePresence mode='wait'>
          <BadgeList
            key={selectedDay ?? 'all'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {dayEntries.length === 0 ? (
              <EmptyText>No hours found.</EmptyText>
            ) : (
              dayEntries.map((entry) => (
                <HourBadge
                  key={entry.file_key}
                  fileKey={entry.file_key}
                  createdAt={entry.created_at}
                  active={selectedFile === entry.file_key}
                  onClick={() => onHourSelect(entry.file_key)}
                />
              ))
            )}
          </BadgeList>
        </AnimatePresence>
      </BadgeSection>
    </Panel>
  );
}
