'use client';

import { useState, useEffect, useCallback } from 'react';
import { Typography, CircularProgress, Box, Alert } from '@mui/material';
import { CollapsibleTable } from 'app/src/core/components/CollapsibleTable';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import { Project, rulesTableApi, RuleVersion } from 'app/src/modules/hub/api/entireRuleApi';



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

  const fetchAllData = useCallback(async () => {
    const fetchProjectRules = async (project: Project): Promise<ProjectRuleRow[]> => {
      try {
        // Fetch rules for project using API service
        const rules = await rulesTableApi.getProjectRules(project.project_key);

        // If no rules returned, return empty array
        if (rules.length === 0) return [];

        // Fetch versions for each rule and create rows
        const allRows: ProjectRuleRow[] = [];
        
        for (const rule of rules) {
          const versions = await rulesTableApi.getRuleVersions(rule.rule_key);
          
          if (versions.length > 0) {
            // Creates a row for each version
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
            // If no versions found
            allRows.push({
              id: `${rule.rule_key}-NA`,
              name: rule.name,
              version: 'N/A',
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

      // Fetch all projects using API service
      const projects = await rulesTableApi.getActiveProjects();

      // Fetch rules and versions for each project
      const sectionsData: ProjectSection[] = await Promise.all(
        projects.map(async (project) => {
          const rows = await fetchProjectRules(project);

          // If no rules, add an empty state row
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
      render: (row: ProjectRuleRow) => (
        row.isEmptyState ? null : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {row.approvalStatus === 'Approved' ? (
              <CheckCircleIcon color="success" />
            ) : (
              <CheckCircleOutlinedIcon
                sx={{ cursor: row.approvalStatus === 'Pending' ? 'pointer' : 'default' }}
                onClick={() =>
                  row.approvalStatus === 'Pending' &&
                  handleStatusChange(
  row.project_key,
  row.id,
  row.rule_key,
  row.version,
  'Approved'
)
                }
              />
            )}
            {row.approvalStatus === 'Rejected' ? (
              <CancelIcon color="error" />
            ) : (
              <CancelOutlinedIcon
                sx={{ cursor: row.approvalStatus === 'Pending' ? 'pointer' : 'default' }}
                onClick={() =>
                  row.approvalStatus === 'Pending' &&
                  handleStatusChange(
  row.project_key,
  row.id,
  row.rule_key,
  row.version,
  'Rejected'
)

                }
              />
            )}
          </Box>
        )
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
    <CollapsibleTable
      sections={sections}
      columns={columns}
      getRowId={(row) => row.id}
    />
  );
}