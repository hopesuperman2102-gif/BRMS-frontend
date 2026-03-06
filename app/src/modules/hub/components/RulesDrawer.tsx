'use client';

import {
  Alert,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { ApprovalStatus, ProjectRuleRow, RulesDrawerProps } from '@/modules/hub/types/hubTypes';
import { brmsTheme } from '@/core/theme/brmsTheme';

const { colors, fonts } = brmsTheme;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const orbFloat = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50%       { transform: translateY(-10px) scale(1.05); }
`;

const dotPulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.6); }
`;

const DrawerTopSection = styled(Box)({
  position: 'relative',
  background: colors.panelBg,
  overflow: 'hidden',
  padding: '28px 24px 24px',
  borderRadius: 16,
});

const DotGrid = styled(Box)({
  position: 'absolute', inset: 0, pointerEvents: 'none',
  opacity: 0.07,
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
});

const GlowOrb = styled(Box)({
  position: 'absolute', top: -40, right: -40,
  width: 180, height: 180, borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(99,82,218,0.35) 0%, transparent 70%)',
  pointerEvents: 'none',
  animation: `${orbFloat} 6s ease-in-out infinite`,
});

const GlowOrbSecondary = styled(Box)({
  position: 'absolute', bottom: -30, left: -20,
  width: 110, height: 110, borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(139,119,232,0.2) 0%, transparent 70%)',
  pointerEvents: 'none',
  animation: `${orbFloat} 8s ease-in-out infinite reverse`,
});

const TopContent = styled(Box)({ position: 'relative', zIndex: 1 });

const RuleBadge = styled(Box)({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.13)',
  borderRadius: 6, padding: '3px 10px', marginBottom: 14,
});

const RuleBadgeText = styled(Typography)({
  fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.15em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontFamily: fonts.mono,
});

const RuleNameText = styled(Typography)({
  fontSize: '1.12rem', fontWeight: 800, color: '#fff',
  lineHeight: 1.3, letterSpacing: '-0.02em', wordBreak: 'break-word', marginBottom: 20,
});

const DecorativeBar = styled(Box)({ display: 'flex', alignItems: 'center', gap: 6 });

const BarSegment = styled(Box)<{ w: number; op: number }>(({ w, op }) => ({
  height: 3, width: w, borderRadius: 99, background: `rgba(255,255,255,${op})`,
}));

const InfoSection = styled(Box)({
  padding: '20px 0 0 0',
  display: 'flex', flexDirection: 'column', gap: 0,
  animation: `${fadeIn} 0.4s ease both`,
});

const InfoRow = styled(Box)<{ delay?: number }>(({ delay = 0 }) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '13px 0',
  animation: `${fadeIn} 0.35s ease ${delay}ms both`,
}));

const RowLabel = styled(Typography)({
  fontSize: '0.72rem', fontWeight: 600, color: colors.lightTextHigh,
  display: 'flex', alignItems: 'center', gap: 6,
});

const RowValue = styled(Typography)({
  fontSize: '0.82rem', fontWeight: 700, color: colors.lightTextHigh,
  textAlign: 'right', fontFamily: fonts.mono, maxWidth: '55%', wordBreak: 'break-word',
});

const StatusBadge = styled(Box)<{ bg: string; textColor: string; borderColor: string }>(
  ({ bg, textColor, borderColor }) => ({
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 10px 3px 7px', borderRadius: 20,
    fontSize: '0.72rem', fontWeight: 700,
    background: bg, color: textColor, border: `1.5px solid ${borderColor}`,
  })
);

const PulseDot = styled(Box)<{ dotColor: string }>(({ dotColor }) => ({
  width: 6, height: 6, borderRadius: '50%', background: dotColor,
  animation: `${dotPulse} 2s ease-in-out infinite`, flexShrink: 0,
}));

const StyledDivider = styled(Divider)({ borderColor: colors.lightBorder, opacity: 0.7 });

const getApprovalChip = (status: ApprovalStatus) => {
  if (status === 'Approved') return { color: colors.approvedText, bg: colors.approvedBg, border: colors.approvedBorder };
  if (status === 'Rejected') return { color: colors.deleteRed,    bg: colors.errorBg,    border: colors.errorBorder };
  return { color: colors.statusInactiveText, bg: colors.statusInactiveBg, border: colors.statusInactiveBorder };
};

const getProjectStatusChip = (status: string) => {
  if (status === 'Active')   return { color: colors.statusUsingText,    bg: colors.statusUsingBg,    border: colors.statusUsingBorder };
  if (status === 'Archived') return { color: colors.statusInactiveText, bg: colors.statusInactiveBg, border: colors.statusInactiveBorder };
  return { color: colors.statusDraftText, bg: colors.statusDraftBg, border: colors.statusDraftBorder };
};

const getApprovalIcon = (status: ApprovalStatus) => {
  if (status === 'Approved') return <CheckCircleOutlineIcon sx={{ fontSize: 12 }} />;
  if (status === 'Rejected') return <CancelOutlinedIcon sx={{ fontSize: 12 }} />;
  return <HourglassEmptyIcon sx={{ fontSize: 12 }} />;
};

export default function RulesDrawer({ selectedRow, canReview }: RulesDrawerProps) {
  const approvalChip  = selectedRow ? getApprovalChip(selectedRow.approvalStatus)     : null;
  const projectChip   = selectedRow ? getProjectStatusChip(selectedRow.projectStatus) : null;
  const approvalStatus = selectedRow?.approvalStatus ?? 'Pending';

  return (
    <>
      <DrawerTopSection>
        <DotGrid />
        <GlowOrb />
        <GlowOrbSecondary />
        <TopContent>
          <RuleBadge>
            <RuleBadgeText>Rule</RuleBadgeText>
          </RuleBadge>

          <RuleNameText>{selectedRow?.name ?? '—'}</RuleNameText>

          <DecorativeBar>
            <BarSegment w={36} op={0.55} />
            <BarSegment w={20} op={0.25} />
            <BarSegment w={8}  op={0.12} />
          </DecorativeBar>
        </TopContent>
      </DrawerTopSection>

      <InfoSection>
        <InfoRow delay={60}>
          <RowLabel>Project</RowLabel>
          <RowValue sx={{ fontFamily: 'inherit', fontWeight: 600, fontSize: '0.84rem' }}>
            {selectedRow?.projectName ?? '—'}
          </RowValue>
        </InfoRow>
        <StyledDivider />

        <InfoRow delay={120}>
          <RowLabel>Version</RowLabel>
          <RowValue>{selectedRow?.version ?? '—'}</RowValue>
        </InfoRow>
        <StyledDivider />

        <InfoRow delay={180}>
          <RowLabel>Project Status</RowLabel>
          {projectChip && (
            <StatusBadge bg={projectChip.bg} textColor={projectChip.color} borderColor={projectChip.border}>
              <PulseDot dotColor={projectChip.color} />
              {selectedRow?.projectStatus ?? '—'}
            </StatusBadge>
          )}
        </InfoRow>
        <StyledDivider />

        <InfoRow delay={240}>
          <RowLabel>Approval</RowLabel>
          {approvalChip && (
            <StatusBadge bg={approvalChip.bg} textColor={approvalChip.color} borderColor={approvalChip.border}>
              {getApprovalIcon(approvalStatus)}
              {approvalStatus}
            </StatusBadge>
          )}
        </InfoRow>
      </InfoSection>

      {selectedRow?.version === '--' && (
        <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.78rem', mt: 2 }}>
          No version available. Create a version before reviewing this rule.
        </Alert>
      )}
      {!canReview && (
        <Alert severity="warning" sx={{ borderRadius: 2, fontSize: '0.78rem', mt: 2 }}>
          You don't have permission to approve or reject this rule.
        </Alert>
      )}
    </>
  );
}