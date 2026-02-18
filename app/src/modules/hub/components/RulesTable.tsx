'use client';

import { useState, useEffect, useCallback } from 'react';
import { Typography, CircularProgress, Box, Alert } from '@mui/material';
import { RcCollapsibleTable } from 'app/src/core/components/RcCollapsibleTable';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import { Project, rulesTableApi, RuleVersion } from 'app/src/modules/hub/api/entireRuleApi';
import AlertComponent, { useAlertStore } from 'app/src/core/components/Alert';

// Types
type ProjectRuleRow = {
  id: string;
  name: string;
  version: string;
  projectStatus: string;
  approvalStatus: 'Approved' | 'Pending' | 'Rejected';
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

// Map API status to UI status
const mapStatus = (status: string): string => {
  const upperStatus = status.toUpperCase();
  if (upperStatus === 'ACTIVE' || upperStatus === 'USING') return 'Active';
  if (upperStatus === 'DRAFT') return 'Draft';
  if (upperStatus === 'ARCHIVED') return 'Archived';
  return 'Draft';
};

export default function RulesTable() {
  const [sections, setSections] = useState<ProjectSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlertStore();

  const fetchAllData = useCallback(async () => {
    const fetchProjectRules = async (project: Project): Promise<ProjectRuleRow[]> => {
      try {
        const rules = await rulesTableApi.getProjectRules(project.project_key);
        if (rules.length === 0) return [];

        const allRows: ProjectRuleRow[] = [];
        
        for (const rule of rules) {
          const versions = await rulesTableApi.getRuleVersions(rule.rule_key);
          
          if (versions.length > 0) {
            versions.forEach((version: RuleVersion) => {
              allRows.push({
                id: `${rule.rule_key}-${version.version}`,
                name: rule.name,
                version: version.version,
                projectStatus: mapStatus(rule.status),
                approvalStatus: mapApprovalStatus(
                (version.status as 'APPROVED' | 'REJECTED' | 'PENDING') ?? 'PENDING'
              ),
                rule_key: rule.rule_key,
                project_key: project.project_key,
              });
            });
          } else {
            allRows.push({
              id: `${rule.rule_key}-NA`,
              name: rule.name,
              version: '--',
              projectStatus: mapStatus(rule.status),
              approvalStatus: 'Pending',
              rule_key: rule.rule_key,
              project_key: project.project_key,
            });
          }
        }

        return allRows;
      } catch (error) {
        console.error(`Error fetching rules for project ${project.project_key}:`, error);
        return [];
      }
    };

    try {
      setLoading(true);
      setError(null);

      const projects = await rulesTableApi.getActiveProjects();

      const sectionsData: ProjectSection[] = await Promise.all(
        projects.map(async (project) => {
          const rows = await fetchProjectRules(project);

          if (rows.length === 0) {
            rows.push({
              id: `${project.project_key}-empty`,
              name: `No rules created yet in ${project.name}`,
              version: '',
              projectStatus: '',
              approvalStatus: 'Pending',
              rule_key: '',
              project_key: project.project_key,
              isEmptyState: true,
            });
          }

          return {
            key: project.project_key,
            title: project.name,
            showHeader: true,
            rows,
          };
        })
      );

      setSections(sectionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAllData();
  }, [fetchAllData]);

  const handleStatusChange = async (
    projectKey: string,
    ruleId: string,
    ruleKey: string,
    version: string,
    status: 'Approved' | 'Rejected'
  ) => {
  try {
    const action = status === 'Approved' ? 'APPROVED' : 'REJECTED';

    const response = await rulesTableApi.reviewRuleVersion(
      ruleKey,
      version,
      action,
      'qa_user'
    );

    const updatedStatus = mapApprovalStatus(response.status);

    setSections((prev) =>
      prev.map((project) =>
        project.key === projectKey
          ? {
              ...project,
              rows: project.rows.map((rule) =>
                rule.id === ruleId
                  ? { ...rule, approvalStatus: updatedStatus }
                  : rule
              ),
            }
          : project
      )
    );
  } catch (error) {
    console.error('Approval update failed:', error);
  }
};

  const mapApprovalStatus = (
  status: 'APPROVED' | 'REJECTED' | 'PENDING'
): 'Approved' | 'Rejected' | 'Pending' => {
  if (status === 'APPROVED') return 'Approved';
  if (status === 'REJECTED') return 'Rejected';
  return 'Pending';
};


  const columns = [
    {
      key: 'name',
      label: 'Rule Name',
      render: (row: ProjectRuleRow) => (
      <Typography sx={{ pl: 2 }}>{row.name}</Typography>
    ),
    },
    {
      key: 'version',
      label: 'Version',
      render: (row: ProjectRuleRow) => (
        row.isEmptyState ? null : (
          <Typography>{row.version}</Typography>
        )
      ),
    },
    {
      key: 'ruleStatus',
      label: 'Status',
      render: (row: ProjectRuleRow) => (
        row.isEmptyState ? null : (
          <Typography>{row.projectStatus}</Typography>
        )
      ),
    },
    {
      key: 'approvalStatus',
      label: 'Approval Status',
      render: (row: ProjectRuleRow) => (
        row.isEmptyState ? null : (
          <Typography>{row.approvalStatus}</Typography>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Approval',
      render: (row: ProjectRuleRow) =>
        row.isEmptyState ? null : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Approve Button */}
            <Box
              onClick={() => {
                if (row.version === '--') {
                  showAlert('No version available for this rule. Please create a version before approving.', 'info');
                  return;
                }
                if (row.approvalStatus === 'Pending') {
                  handleStatusChange(row.project_key, row.id, row.rule_key, row.version, 'Approved');
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                ...(row.approvalStatus === 'Approved'
                  ? {
                      bgcolor: '#dcfce7',
                      color: '#16a34a',
                      border: '1px solid #bbf7d0',
                    }
                  : row.approvalStatus === 'Pending'
                  ? {
                      bgcolor: 'transparent',
                      color: '#94a3b8',
                      border: '1px dashed #cbd5e1',
                      '&:hover': {
                        bgcolor: '#dcfce7',
                        color: '#16a34a',
                        border: '1px solid #bbf7d0',
                      },
                    }
                  : {
                      bgcolor: 'transparent',
                      color: '#cbd5e1',
                      border: '1px dashed #e2e8f0',
                      pointerEvents: 'none',
                    }),
              }}
            >
              {row.approvalStatus === 'Approved' ? (
                <CheckCircleIcon sx={{ fontSize: 14 }} />
              ) : (
                <CheckCircleOutlinedIcon sx={{ fontSize: 14 }} />
              )}
              Approve
            </Box>

            {/* Reject Button */}
            <Box
              onClick={() => {
                if (row.version === '--') {
                  showAlert('No version available for this rule. Please create a version before rejecting.', 'info');
                  return;
                }
                if (row.approvalStatus === 'Pending') {
                  handleStatusChange(row.project_key, row.id, row.rule_key, row.version, 'Rejected');
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                ...(row.approvalStatus === 'Rejected'
                  ? {
                      bgcolor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                    }
                  : row.approvalStatus === 'Pending'
                  ? {
                      bgcolor: 'transparent',
                      color: '#94a3b8',
                      border: '1px dashed #cbd5e1',
                      '&:hover': {
                        bgcolor: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                      },
                    }
                  : {
                      bgcolor: 'transparent',
                      color: '#cbd5e1',
                      border: '1px dashed #e2e8f0',
                      pointerEvents: 'none',
                    }),
              }}
            >
              {row.approvalStatus === 'Rejected' ? (
                <CancelIcon sx={{ fontSize: 14 }} />
              ) : (
                <CancelOutlinedIcon sx={{ fontSize: 14 }} />
              )}
              Reject
            </Box>
          </Box>
        ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading data: {error}
      </Alert>
    );
  }

  if (sections.length === 0) {
    return (
      <Alert severity="info">
        No projects found
      </Alert>
    );
  }

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