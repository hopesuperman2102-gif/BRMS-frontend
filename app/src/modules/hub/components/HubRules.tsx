'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RcAlertComponent, { useAlertStore } from '@/core/components/RcAlertComponent';
import {
  ApprovalStatus,
  ProjectRuleRow,
  ProjectSection,
  ReviewRow,
  RuleVersion,
  VerticalProject,
  VerticalRule,
} from '@/modules/hub/types/hubTypes';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { rulesTableApi } from '@/modules/hub/api/entireRuleApi';
import { useRole } from '@/modules/auth/hooks/useRole';
import RcAppDrawer from '@/core/components/RcAppdrawer';
import RulesDrawer from './RulesDrawer';

const { colors } = brmsTheme;

/* ─── Helpers ─────────────────────────────────────────────── */

const mapStatus = (status: string): string => {
  const s = status.toUpperCase();
  if (s === 'ACTIVE' || s === 'USING') return 'Active';
  if (s === 'DRAFT') return 'Draft';
  if (s === 'ARCHIVED') return 'Archived';
  return 'Draft';
};

const mapApprovalStatus = (status: string): ApprovalStatus => {
  if (status === 'APPROVED') return 'Approved';
  if (status === 'REJECTED') return 'Rejected';
  return 'Pending';
};

const getApprovalChip = (status: ApprovalStatus) => {
  if (status === 'Approved') return { color: colors.approvedText, bg: colors.approvedBg, border: colors.approvedBorder };
  if (status === 'Rejected') return { color: colors.deleteRed, bg: colors.errorBg, border: colors.errorBorder };
  return { color: colors.statusInactiveText, bg: colors.statusInactiveBg, border: colors.statusInactiveBorder };
};

const getProjectStatusChip = (status: string) => {
  if (status === 'Active') return { color: colors.statusUsingText, bg: colors.statusUsingBg, border: colors.statusUsingBorder };
  if (status === 'Archived') return { color: colors.statusInactiveText, bg: colors.statusInactiveBg, border: colors.statusInactiveBorder };
  return { color: colors.statusDraftText, bg: colors.statusDraftBg, border: colors.statusDraftBorder };
};

const buildRows = (rules: VerticalRule[], project_key: string): ProjectRuleRow[] => {
  const rows: ProjectRuleRow[] = [];
  const activeRules = rules.filter((r) => r.status.toUpperCase() !== 'DELETED');
  for (const rule of activeRules) {
    if (rule.versions.length > 0) {
      rule.versions.forEach((v: RuleVersion) => {
        rows.push({
          id: `${rule.rule_key}-${v.version}`,
          name: rule.rule_name,
          version: v.version,
          projectStatus: mapStatus(rule.status),
          approvalStatus: mapApprovalStatus(v.status),
          rule_key: rule.rule_key,
          project_key,
        });
      });
    } else {
      rows.push({
        id: `${rule.rule_key}-NA`,
        name: rule.rule_name,
        version: '--',
        projectStatus: mapStatus(rule.status),
        approvalStatus: 'Pending',
        rule_key: rule.rule_key,
        project_key,
      });
    }
  }
  return rows;
};

const buildSections = (projects: VerticalProject[]): ProjectSection[] =>
  projects.map((project) => {
    const rows = buildRows(project.rules, project.project_key);
    if (rows.length === 0) {
      rows.push({
        id: `${project.project_key}-empty`,
        name: `No rules created yet in ${project.project_name}`,
        version: '',
        projectStatus: '',
        approvalStatus: 'Pending',
        rule_key: '',
        project_key: project.project_key,
        isEmptyState: true,
      });
    }
    return { key: project.project_key, title: project.project_name, showHeader: true, rows };
  });

/* ─── Styled Components ───────────────────────────────────── */

const Root = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  fontFamily: brmsTheme.fonts.sans,
});

const ListWrap = styled(Paper)({
  border: `1px solid ${colors.lightBorder}`,
  borderRadius: 12,
  boxShadow: 'none',
  backgroundColor: colors.white,
  overflow: 'hidden',
});

const InnerPadding = styled(Box)({
  padding: '9.6px',
  backgroundColor: colors.formBg,
});

const StyledAccordion = styled(Accordion)({
  marginBottom: 8,
  borderRadius: '10px !important',
  border: `1px solid ${colors.lightBorder}`,
  boxShadow: 'none',
  overflow: 'hidden',
  '&:before': { display: 'none' },
});

const StyledAccordionSummary = styled(AccordionSummary)({
  minHeight: 48,
  backgroundColor: colors.primaryGlowSoft,
  '& .MuiAccordionSummary-content': { margin: '8px 0' },
  '&:hover': { backgroundColor: colors.primaryGlowMid },
});

const ExpandIcon = styled(ExpandMoreIcon)({
  color: colors.lightTextMid,
});

const SummaryRow = styled(Stack)({
  width: '100%',
});

const SectionTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: '0.88rem',
  color: colors.primaryDark,
});

const RulesCountChip = styled(Chip)({
  fontWeight: 600,
  fontSize: '0.7rem',
  background: colors.white,
  color: colors.primaryDark,
  border: `1px solid ${colors.primaryGlowMid}`,
});

const StyledAccordionDetails = styled(AccordionDetails)({
  padding: '6.4px 8px 4.8px',
  backgroundColor: colors.formBg,
  borderTop: `1px solid ${colors.lightBorder}`,
});

const RuleCard = styled(Paper)({
  padding: '7.2px',
  borderRadius: 6,
  boxShadow: 'none',
  borderColor: colors.lightBorder,
  '&:hover': {
    borderColor: colors.lightBorderHover,
    backgroundColor: colors.lightSurfaceHover,
  },
});

const RuleName = styled(Typography)({
  fontSize: '0.84rem',
  fontWeight: 600,
  color: colors.lightTextHigh,
});

const ChipsRow = styled(Stack)({
  marginTop: 5.6,
  flexWrap: 'wrap',
});

const VersionChip = styled(Chip)({
  height: 22,
  fontSize: '0.68rem',
});

const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => !['chipColor', 'chipBg', 'chipBorder'].includes(prop as string),
})<{ chipColor: string; chipBg: string; chipBorder: string }>(
  ({ chipColor, chipBg, chipBorder }) => ({
    height: 22,
    fontSize: '0.68rem',
    color: chipColor,
    background: chipBg,
    border: `1px solid ${chipBorder}`,
  })
);

const ReviewButton = styled(Button)({
  minWidth: 92,
  height: 30,
  borderRadius: 8,
  textTransform: 'none',
  fontSize: '0.76rem',
  fontWeight: 700,
  color: colors.primary,
  border: `1px solid ${colors.primaryGlowMid}`,
  background: colors.primaryGlowSoft,
  boxShadow: 'none',
  '&:hover': {
    background: 'rgba(101,82,208,0.14)',
    borderColor: colors.primary,
    boxShadow: 'none',
  },
});

const LoadingBox = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  padding: '48px 0',
});

const RuleContentBox = styled(Box)({
  flex: 1,
  minWidth: 0,
});

/* ─── Component ───────────────────────────────────────────── */

export default function HubRules() {
  const { vertical_Key } = useParams<{ vertical_Key: string }>();
  const { isReviewer, isSuperAdmin } = useRole();
  const { showAlert } = useAlertStore();

  const [sections, setSections] = useState<ProjectSection[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [selectedRow, setSelectedRow] = useState<ReviewRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canReview = isReviewer || isSuperAdmin;

  const fetchAllData = useCallback(async () => {
    if (!vertical_Key) {
      setSections([]);
      setLoading(false);
      setError('Vertical key is missing');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const vertical = await rulesTableApi.refreshVerticalRules(vertical_Key);
      setSections(buildSections(vertical.projects));
      setOpenSections({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [vertical_Key]);

  useEffect(() => { void fetchAllData(); }, [fetchAllData]);

  const handleStatusChange = async (
    projectKey: string,
    ruleId: string,
    ruleKey: string,
    version: string,
    status: 'Approved' | 'Rejected',
  ) => {
    if (!canReview) {
      showAlert('You do not have permission to review rule versions.', 'info');
      return;
    }
    try {
      setReviewing(true);
      const response = await rulesTableApi.reviewRuleVersion(
        ruleKey, version,
        status === 'Approved' ? 'APPROVED' : 'REJECTED',
        'qa_user',
      );
      const updated = mapApprovalStatus(response.status);
      setSections((prev) =>
        prev.map((s) =>
          s.key !== projectKey ? s : {
            ...s,
            rows: s.rows.map((r) => r.id !== ruleId ? r : { ...r, approvalStatus: updated }),
          }
        )
      );
      setSelectedRow((prev) => (prev ? { ...prev, approvalStatus: updated } : prev));
      showAlert(`Rule ${status.toLowerCase()} successfully.`, 'success');
    } catch {
      showAlert('Failed to update approval status. Please try again.', 'error');
    } finally {
      setReviewing(false);
    }
  };

  const visibleSections = useMemo(
    () =>
      sections
        .map((s) => ({ ...s, rows: s.rows.filter((r) => !r.isEmptyState) }))
        .filter((s) => s.rows.length > 0),
    [sections],
  );

  const allRows = visibleSections.flatMap((s) =>
    s.rows.map((r) => ({ ...r, projectName: s.title }))
  );

  const canTakeAction = Boolean(
    selectedRow &&
    selectedRow.approvalStatus === 'Pending' &&
    selectedRow.version !== '--' &&
    canReview &&
    !reviewing,
  );

  if (loading) return <LoadingBox><CircularProgress size={28} /></LoadingBox>;
  if (error) return <Alert severity="error">Error loading data: {error}</Alert>;
  if (!allRows.length) return <Alert severity="info">No rules found for this vertical.</Alert>;

  return (
    <Root>
      <RcAlertComponent />

      <ListWrap>
        <InnerPadding>
          {visibleSections.map((section) => {
            const isOpen = Boolean(openSections[section.key]);
            return (
              <StyledAccordion
                key={section.key}
                disableGutters
                expanded={isOpen}
                onChange={() =>
                  setOpenSections((prev) => ({ ...prev, [section.key]: !prev[section.key] }))
                }
              >
                <StyledAccordionSummary expandIcon={<ExpandIcon />}>
                  <SummaryRow direction="row" justifyContent="space-between" alignItems="center">
                    <SectionTitle>{section.title}</SectionTitle>
                    <RulesCountChip size="small" label={`${section.rows.length} Rules`} />
                  </SummaryRow>
                </StyledAccordionSummary>

                <StyledAccordionDetails>
                  <Stack spacing={0.55}>
                    {section.rows.map((rule) => {
                      const approval = getApprovalChip(rule.approvalStatus);
                      const ps = getProjectStatusChip(rule.projectStatus);
                      return (
                        <RuleCard key={rule.id} variant="outlined">
                          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
                            <RuleContentBox>
                              <RuleName>{rule.name}</RuleName>
                              <ChipsRow direction="row" spacing={0.6}>
                                <VersionChip size="small" variant="outlined" label={`version : ${rule.version}`} />
                                <StatusChip size="small" label={rule.projectStatus} chipColor={ps.color} chipBg={ps.bg} chipBorder={ps.border} />
                                <StatusChip size="small" label={rule.approvalStatus} chipColor={approval.color} chipBg={approval.bg} chipBorder={approval.border} />
                              </ChipsRow>
                            </RuleContentBox>
                            <ReviewButton
                              size="small"
                              variant="outlined"
                              onClick={() => setSelectedRow({ ...rule, projectName: section.title })}
                            >
                              Review
                            </ReviewButton>
                          </Stack>
                        </RuleCard>
                      );
                    })}
                  </Stack>
                </StyledAccordionDetails>
              </StyledAccordion>
            );
          })}
        </InnerPadding>
      </ListWrap>

      <RcAppDrawer
        open={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
        title="Rule Review"
        subtitle="Review and submit decision"
        actions={[
          {
            label: 'Approve', loadingLabel: 'Saving...', color: 'success', variant: 'contained',
            disabled: !canTakeAction, loading: reviewing,
            onClick: () => {
              if (!selectedRow) return;
              void handleStatusChange(selectedRow.project_key, selectedRow.id, selectedRow.rule_key, selectedRow.version, 'Approved');
            },
          },
          {
            label: 'Reject', color: 'error', variant: 'outlined', disabled: !canTakeAction,
            onClick: () => {
              if (!selectedRow) return;
              void handleStatusChange(selectedRow.project_key, selectedRow.id, selectedRow.rule_key, selectedRow.version, 'Rejected');
            },
          },
        ]}
      >
        <RulesDrawer selectedRow={selectedRow} canReview={canReview} />
      </RcAppDrawer>
    </Root>
  );
}