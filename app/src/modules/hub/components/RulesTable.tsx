'use client';

import { useState, useEffect, useCallback } from 'react';
import { Typography, CircularProgress, Box, Alert } from '@mui/material';
import { RcCollapsibleTable } from 'app/src/core/components/RcCollapsibleTable';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import { rulesTableApi, VerticalRule, VerticalProject, RuleVersion } from 'app/src/modules/hub/api/entireRuleApi';
import AlertComponent, { useAlertStore } from 'app/src/core/components/Alert';

// ─── Types ────────────────────────────────────────────────────────────────────

type ApprovalStatus = 'Approved' | 'Pending' | 'Rejected';

type ProjectRuleRow = {
  id: string;
  name: string;
  version: string;
  projectStatus: string;
  approvalStatus: ApprovalStatus;
  rule_key: string;
  project_key: string;
  isEmptyState?: boolean;
};

type ProjectSection = {
  key: string;
  title: string;
  showHeader: boolean;
  rows: ProjectRuleRow[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function RulesTable() {
  const [sections, setSections] = useState<ProjectSection[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const { showAlert }           = useAlertStore();

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Always force-refresh — this component mounts fresh every time the
      // user switches to the Rules tab, so we always want live data.
      const vertical = await rulesTableApi.refreshVerticalRules();
      setSections(buildSections(vertical.projects));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Runs every time the tab is switched to (component remounts each time)
  // No focus/visibilitychange listeners needed — remount IS the trigger.
  useEffect(() => { void fetchAllData(); }, [fetchAllData]);

  // ── Approve / Reject ────────────────────────────────────────────────────────
  const handleStatusChange = async (
    projectKey: string,
    ruleId: string,
    ruleKey: string,
    version: string,
    status: 'Approved' | 'Rejected',
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

  // ── Styles ──────────────────────────────────────────────────────────────────
  const approvedSx = { bgcolor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' };
  const rejectedSx = { bgcolor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' };
  const pendingSx  = { bgcolor: 'transparent', color: '#94a3b8', border: '1px dashed #cbd5e1' };
  const disabledSx = { bgcolor: 'transparent', color: '#cbd5e1', border: '1px dashed #e2e8f0', pointerEvents: 'none' as const };
  const baseSx     = {
    display: 'flex', alignItems: 'center', gap: 0.5,
    px: 1.5, py: 0.5, borderRadius: '20px',
    fontSize: '0.75rem', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s ease',
  };

  // ── Columns ─────────────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'name',
      label: 'Rule Name',
      render: (row: ProjectRuleRow) => <Typography sx={{ pl: 2 }}>{row.name}</Typography>,
    },
    {
      key: 'version',
      label: 'Version',
      render: (row: ProjectRuleRow) =>
        row.isEmptyState ? null : <Typography>{row.version}</Typography>,
    },
    {
      key: 'ruleStatus',
      label: 'Status',
      render: (row: ProjectRuleRow) =>
        row.isEmptyState ? null : <Typography>{row.projectStatus}</Typography>,
    },
    {
      key: 'approvalStatus',
      label: 'Approval Status',
      render: (row: ProjectRuleRow) =>
        row.isEmptyState ? null : <Typography>{row.approvalStatus}</Typography>,
    },
    {
      key: 'actions',
      label: 'Approval',
      render: (row: ProjectRuleRow) => {
        if (row.isEmptyState) return null;

        const noVersion = row.version === '--';

        const onApprove = () => {
          if (noVersion) { showAlert('No version available. Please create a version before approving.', 'info'); return; }
          if (row.approvalStatus === 'Pending') void handleStatusChange(row.project_key, row.id, row.rule_key, row.version, 'Approved');
        };

        const onReject = () => {
          if (noVersion) { showAlert('No version available. Please create a version before rejecting.', 'info'); return; }
          if (row.approvalStatus === 'Pending') void handleStatusChange(row.project_key, row.id, row.rule_key, row.version, 'Rejected');
        };

        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box onClick={onApprove} sx={{
              ...baseSx,
              ...(row.approvalStatus === 'Approved' ? approvedSx
                : row.approvalStatus === 'Pending'  ? { ...pendingSx, '&:hover': approvedSx }
                : disabledSx),
            }}>
              {row.approvalStatus === 'Approved' ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CheckCircleOutlinedIcon sx={{ fontSize: 14 }} />}
              Approve
            </Box>

            <Box onClick={onReject} sx={{
              ...baseSx,
              ...(row.approvalStatus === 'Rejected' ? rejectedSx
                : row.approvalStatus === 'Pending'  ? { ...pendingSx, '&:hover': rejectedSx }
                : disabledSx),
            }}>
              {row.approvalStatus === 'Rejected' ? <CancelIcon sx={{ fontSize: 14 }} /> : <CancelOutlinedIcon sx={{ fontSize: 14 }} />}
              Reject
            </Box>
          </Box>
        );
      },
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
      <CircularProgress />
    </Box>
  );

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