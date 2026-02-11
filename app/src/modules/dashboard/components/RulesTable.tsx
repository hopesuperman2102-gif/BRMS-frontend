'use client';
 
import { useState, useEffect, useCallback } from 'react';
import { Typography, CircularProgress, Box, Alert } from '@mui/material';
import { CollapsibleTable } from 'app/src/core/components/CollapsibleTable';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
 
// Types
type ProjectRuleRow = {
  id: string;
  name: string;
  version: string;
  projectStatus: string;
  approvalStatus: 'Approved' | 'Pending' | 'Rejected';
  rule_key: string;
  project_key: string;
  isEmptyState?: boolean; // Add flag for empty state
};
 
type ProjectSection = {
  key: string;
  title: string;
  showHeader: boolean;
  rows: ProjectRuleRow[];
};
 
type Project = {
  project_key: string;
  name: string;
  status: string;
};
 
type Rule = {
  rule_key: string;
  name: string;
  status: string;
};
 
type RuleVersion = {
  version: string;
};
 
const API_BASE_URL = 'http://127.0.0.1:8000';
 
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
    const fetchRuleVersions = async (rule_key: string): Promise<RuleVersion[]> => {
      try {
        const versionsResponse = await fetch(`${API_BASE_URL}/api/v1/rule-versions/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rule_key }),
        });
    
        if (!versionsResponse.ok) return [];
    
        return await versionsResponse.json();
      } catch (error) {
        console.error(`Error fetching versions for rule ${rule_key}:`, error);
        return [];
      }
    };

    const fetchProjectRules = async (project: Project): Promise<ProjectRuleRow[]> => {
      try {
        // Fetch rules for project
        const rulesResponse = await fetch(`${API_BASE_URL}/api/v1/rules/project/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_key: project.project_key }),
        });
    
        if (!rulesResponse.ok) return [];
    
        const rules: Rule[] = await rulesResponse.json();
        // If no rules returned, return empty array
        if (rules.length === 0) return [];
    
        // Fetch versions for each rule and create rows
        const allRows: ProjectRuleRow[] = [];
    
        for (const rule of rules) {
          const versions = await fetchRuleVersions(rule.rule_key);
    
          if (versions.length > 0) {
            // Creates a row for each version
            versions.forEach((version) => {
              allRows.push({
                id: `${rule.rule_key}-${version.version}`,
                name: rule.name,
                version: version.version,
                projectStatus: mapStatus(rule.status),
                approvalStatus: 'Pending',
                rule_key: rule.rule_key,
                project_key: project.project_key,
              });
            });
          } else {
            // If No versions found
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
 
      // Fetch all projects
      const projectsResponse = await fetch(`${API_BASE_URL}/api/v1/projects/view/active`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
 
      if (!projectsResponse.ok) {
        throw new Error('Failed to fetch projects');
      }
 
      const projects: Project[] = await projectsResponse.json();
 
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
 
  const handleStatusChange = (
    projectKey: string,
    ruleId: string,
    status: 'Approved' | 'Rejected'
  ) => {
    setSections((prev) =>
      prev.map((project) =>
        project.key === projectKey
          ? {
              ...project,
              rows: project.rows.map((rule) =>
                rule.id === ruleId ? { ...rule, approvalStatus: status } : rule
              ),
            }
          : project
      )
    );
  };
 
  const columns = [
    {
      key: 'name',
      label: 'Rule Name',
      render: (row: ProjectRuleRow) => (
        <Typography
          color={row.isEmptyState ? 'text.secondary' : 'text.primary'}
          fontStyle={row.isEmptyState ? 'italic' : 'normal'}
        >
          {row.name}
        </Typography>
      ),
    },
    {
      key: 'version',
      label: 'Version',
      render: (row: ProjectRuleRow) => (
        row.isEmptyState ? null : (
          <Typography color="text.secondary">{row.version}</Typography>
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
          <Box>
            {row.approvalStatus === 'Approved' ? (
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            ) : (
              <CheckCircleOutlinedIcon
                color="success"
                sx={{
                  cursor: row.approvalStatus === 'Rejected' ? 'not-allowed' : 'pointer',
                  opacity: row.approvalStatus === 'Rejected' ? 0.4 : 1,
                  mr: 1,
                }}
                onClick={() =>
                  row.approvalStatus === 'Pending' &&
                  handleStatusChange(row.project_key, row.id, 'Approved')
                }
              />
            )}
 
            {row.approvalStatus === 'Rejected' ? (
              <CancelIcon color="error" />
            ) : (
              <CancelOutlinedIcon
                color="error"
                sx={{
                  cursor: row.approvalStatus === 'Approved' ? 'not-allowed' : 'pointer',
                  opacity: row.approvalStatus === 'Approved' ? 0.4 : 1,
                }}
                onClick={() =>
                  row.approvalStatus === 'Pending' &&
                  handleStatusChange(row.project_key, row.id, 'Rejected')
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }
 
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading data: {error}
      </Alert>
    );
  }
 
  if (sections.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No projects found
      </Alert>
    );
  }
 
  return (
    <Box
      sx={{
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: 2,
        overflow: 'hidden',
      }}
    >
      <CollapsibleTable
        columns={columns}
        sections={sections}
        getRowId={(row) => row.id}
      />
    </Box>
  );
}