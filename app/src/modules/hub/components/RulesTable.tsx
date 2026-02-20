'use client';

import { useState, useEffect, useCallback } from 'react';
import { Typography, CircularProgress, Box, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { RcCollapsibleTable } from 'app/src/core/components/RcCollapsibleTable';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import { rulesTableApi, VerticalRule, VerticalProject, RuleVersion } from 'app/src/modules/hub/api/entireRuleApi';
import AlertComponent, { useAlertStore } from 'app/src/core/components/Alert';
import { ApprovalStatus, ProjectRuleRow, ProjectSection } from '../types/ruleTableTypes';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';

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

const buildRows = (rules: VerticalRule[], project_key: string): ProjectRuleRow[] => {
  const rows: ProjectRuleRow[] = [];
  const activeRules = rules.filter((r: VerticalRule) => r.status.toUpperCase() !== 'DELETED');

  for (const rule of activeRules) {
    if (rule.versions.length > 0) {
      rule.versions.forEach((v: RuleVersion) => {
        rows.push({
          id:             `${rule.rule_key}-${v.version}`,
          name:           rule.rule_name,
          version:        v.version,
          projectStatus:  mapStatus(rule.status),
          approvalStatus: mapApprovalStatus(v.status),
          rule_key:       rule.rule_key,
          project_key,
        });
      });
    } else {
      rows.push({
        id:             `${rule.rule_key}-NA`,
        name:           rule.rule_name,
        version:        '--',
        projectStatus:  mapStatus(rule.status),
        approvalStatus: 'Pending',
        rule_key:       rule.rule_key,
        project_key,
      });
    }
  }
  return rows;
};

const buildSections = (projects: VerticalProject[]): ProjectSection[] =>
  projects.map((project: VerticalProject) => {
    const rows = buildRows(project.rules, project.project_key);
    if (rows.length === 0) {
      rows.push({
        id:             `${project.project_key}-empty`,
        name:           `No rules created yet in ${project.project_name}`,
        version:        '',
        projectStatus:  '',
        approvalStatus: 'Pending',
        rule_key:       '',
        project_key:    project.project_key,
        isEmptyState:   true,
      });
    }
    return {
      key:        project.project_key,
      title:      project.project_name,
      showHeader: true,
      rows,
    };
  });

/* ─── Styled Components ───────────────────────────────────── */

const LoadingWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  padding: 24,
});

const RuleNameText = styled(Typography)({
  paddingLeft: 16,
});

const ActionsRow = styled(Box)({
  display: 'flex',
  gap: 8,
});

const StatusChip = styled(Box)<{ status: 'approved' | 'rejected' | 'pending' | 'disabled' }>(({ status }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  ...(status === 'approved' && {
    backgroundColor: colors.approvedBg,
    color:           colors.approvedText,
    border:          `1px solid ${colors.approvedBorder}`,
  }),

  ...(status === 'rejected' && {
    backgroundColor: colors.errorBg,
    color:           colors.deleteRed,
    border:          `1px solid ${colors.errorBorder}`,
  }),

  ...(status === 'pending' && {
    backgroundColor: 'transparent',
    color:           colors.lightTextLow,
    border:          `1px dashed ${colors.lightBorderHover}`,
  }),

  ...(status === 'disabled' && {
    backgroundColor: 'transparent',
    color:           colors.lightBorderHover,
    border:          `1px dashed ${colors.lightBorder}`,
    pointerEvents:   'none',
  }),
}));

const ApproveChip = styled(StatusChip)({
  '&[data-pending="true"]:hover': {
    backgroundColor: colors.approvedBg,
    color:           colors.approvedText,
    border:          `1px solid ${colors.approvedBorder}`,
  },
});

const RejectChip = styled(StatusChip)({
  '&[data-pending="true"]:hover': {
    backgroundColor: colors.errorBg,
    color:           colors.deleteRed,
    border:          `1px solid ${colors.errorBorder}`,
  },
});

/* ─── Component ───────────────────────────────────────────── */

export default function RulesTable() {
  const [sections, setSections] = useState<ProjectSection[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const { showAlert }           = useAlertStore();

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const vertical = await rulesTableApi.refreshVerticalRules();
      setSections(buildSections(vertical.projects));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAllData(); }, [fetchAllData]);

  const handleStatusChange = async (
    projectKey: string,
    ruleId:     string,
    ruleKey:    string,
    version:    string,
    status:     'Approved' | 'Rejected',
  ) => {
    try {
      const action   = status === 'Approved' ? 'APPROVED' : 'REJECTED';
      const response = await rulesTableApi.reviewRuleVersion(ruleKey, version, action, 'qa_user');
      const updated  = mapApprovalStatus(response.status);

      setSections((prev) =>
        prev.map((section) =>
          section.key !== projectKey ? section : {
            ...section,
            rows: section.rows.map((row) =>
              row.id !== ruleId ? row : { ...row, approvalStatus: updated }
            ),
          }
        )
      );
    } catch {
      showAlert('Failed to update approval status. Please try again.', 'error');
    }
  };

  const columns = [
    {
      key:    'name',
      label:  'Rule Name',
      render: (row: ProjectRuleRow) => (
        <RuleNameText>{row.name}</RuleNameText>
      ),
    },
    {
      key:    'version',
      label:  'Version',
      render: (row: ProjectRuleRow) =>
        row.isEmptyState ? null : <Typography>{row.version}</Typography>,
    },
    {
      key:    'ruleStatus',
      label:  'Status',
      render: (row: ProjectRuleRow) =>
        row.isEmptyState ? null : <Typography>{row.projectStatus}</Typography>,
    },
    {
      key:    'approvalStatus',
      label:  'Approval Status',
      render: (row: ProjectRuleRow) =>
        row.isEmptyState ? null : <Typography>{row.approvalStatus}</Typography>,
    },
    {
      key:    'actions',
      label:  'Approval',
      render: (row: ProjectRuleRow) => {
        if (row.isEmptyState) return null;

        const noVersion = row.version === '--';

        const onApprove = () => {
          if (noVersion) {
            showAlert('No version available. Please create a version before approving.', 'info');
            return;
          }
          if (row.approvalStatus === 'Pending') {
            void handleStatusChange(row.project_key, row.id, row.rule_key, row.version, 'Approved');
          }
        };

        const onReject = () => {
          if (noVersion) {
            showAlert('No version available. Please create a version before rejecting.', 'info');
            return;
          }
          if (row.approvalStatus === 'Pending') {
            void handleStatusChange(row.project_key, row.id, row.rule_key, row.version, 'Rejected');
          }
        };

        const approveStatus = row.approvalStatus === 'Approved'
          ? 'approved'
          : row.approvalStatus === 'Pending'
            ? 'pending'
            : 'disabled';

        const rejectStatus = row.approvalStatus === 'Rejected'
          ? 'rejected'
          : row.approvalStatus === 'Pending'
            ? 'pending'
            : 'disabled';

        return (
          <ActionsRow>
            <ApproveChip
              status={approveStatus}
              data-pending={approveStatus === 'pending'}
              onClick={onApprove}
            >
              {row.approvalStatus === 'Approved'
                ? <CheckCircleIcon sx={{ fontSize: 14 }} />
                : <CheckCircleOutlinedIcon sx={{ fontSize: 14 }} />}
              Approve
            </ApproveChip>

            <RejectChip
              status={rejectStatus}
              data-pending={rejectStatus === 'pending'}
              onClick={onReject}
            >
              {row.approvalStatus === 'Rejected'
                ? <CancelIcon sx={{ fontSize: 14 }} />
                : <CancelOutlinedIcon sx={{ fontSize: 14 }} />}
              Reject
            </RejectChip>
          </ActionsRow>
        );
      },
    },
  ];

  if (loading) return <LoadingWrapper><CircularProgress /></LoadingWrapper>;
  if (error)            return <Alert severity="error">Error loading data: {error}</Alert>;
  if (!sections.length) return <Alert severity="info">No projects found</Alert>;

  return (
    <>
      <AlertComponent />
      <RcCollapsibleTable
        sections={sections}
        columns={columns}
        getRowId={(row) => row.id}
      />
    </>
  );
}