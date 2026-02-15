'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import RcTable from '../../../core/components/RcTable';
import SectionHeader from 'app/src/core/components/SectionHeader';
import { rulesApi } from 'app/src/modules/rules/api/rulesApi';
import { projectsApi } from 'app/src/modules/hub/api/projectsApi';
import { RuleFile } from '../../rules/pages/types/rulesTypes';

// Type definitions for API responses
interface RuleResponse {
  rule_key: string;
  name: string;
  status: string;
  updated_at: string;
}

interface ProjectResponse {
  project_key: string;
  name: string;
}

export default function ProjectRuleComponent() {
  const { project_key } = useParams<{ project_key: string }>();
  const navigate = useNavigate();
  const { verticalId } = useParams(); 

  const [rules, setRules] = useState<RuleFile[]>([]);
  const [projectName, setProjectName] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [menuRule, setMenuRule] = useState<RuleFile | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  /* ---------- Project name ---------- */
  useEffect(() => {
    if (!project_key) return;
    projectsApi.getProjectsView().then((projects: ProjectResponse[]) => {
      const project = projects.find(
        (p: ProjectResponse) => p.project_key === project_key
      );
      if (project?.name) setProjectName(project.name);
    });
  }, [project_key]);

  /* ---------- Rules ---------- */
  useEffect(() => {
    if (!project_key) return;

    let isMounted = true;

    const fetchRules = async () => {
      try {
        const data = await rulesApi.getProjectRules(project_key);
        const rows = await Promise.all(
          data.map(async (r: RuleResponse) => {
            try {
              const versions = await rulesApi.getRuleVersions(r.rule_key);
              return {
                id: r.rule_key,
                name: r.name,
                version: versions?.[0]?.version ?? '-',
                status: r.status,
                updatedAt: r.updated_at,
              };
            } catch {
              return {
                id: r.rule_key,
                name: r.name,
                version: '-',
                status: r.status,
                updatedAt: r.updated_at,
              };
            }
          })
        );

        if (isMounted) {
          setRules(rows);
        }
      } catch (error) {
        console.error('Failed to fetch rules:', error);
        if (isMounted) {
          setRules([]);
        }
      }
    };

    fetchRules();

    return () => {
      isMounted = false;
    };
  }, [project_key, refetchTrigger]);

  /* ---------- Menu ---------- */
  const openMenu = (e: React.MouseEvent<HTMLElement>, rule: RuleFile) => {
    setAnchorEl(e.currentTarget);
    setMenuRule(rule);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setMenuRule(null);
  };

  const handleDelete = async () => {
    if (!menuRule) return;
    try {
      await rulesApi.deleteRule(menuRule.id);
      closeMenu();
      // Trigger refetch by incrementing the counter
      setRefetchTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const handleEdit = () => {
    if (!menuRule) return;
    navigate(
      `/vertical/${verticalId}/dashboard//hub/${project_key}/rules/createrules?key=${menuRule.id}`
    );
    closeMenu();
  };

  const headers = ['Rule Name', 'Version', 'Status', 'Last updated', ''];

  const rows = rules.map((rule) => ({
    'Rule Name': (
      <Typography
        sx={{ cursor: 'pointer', color: '#4f46e5' }}
        onClick={() =>
          navigate(
            `/vertical/${verticalId}/dashboard/hub/${project_key}/rules/editor?rule=${rule.id}`
          )
        }
      >
        {rule.name}
      </Typography>
    ),
    Version: rule.version,
    Status: rule.status,
    'Last updated': rule.updatedAt,
    '': (
      <IconButton onClick={(e) => openMenu(e, rule)}>
        <MoreVertIcon />
      </IconButton>
    ),
  }));

  return (
    <Card>
      <CardContent>
        <SectionHeader
          left={
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton
                onClick={() => navigate(`/vertical/${verticalId}/dashboard/hub`)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  backgroundColor: 'rgba(101, 82, 208, 0.08)',
                  color: '#6552D0',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  '&:hover': {
                    backgroundColor: 'rgba(101, 82, 208, 0.15)',
                    transform: 'translateX(-2px)',
                  },
                }}
              >
              <ArrowBackIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <Typography 
              sx={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#374151',
                whiteSpace: 'nowrap',
              }}>
                {projectName || <Skeleton width={120} />}
              </Typography>
            </Box>
          }
          right={
            <Button
              variant="contained"
              onClick={() =>
                navigate(
                  `/vertical/${verticalId}/dashboard/hub/${project_key}/rules/createrules`
                )
              }
            >
              CREATE RULE
            </Button>
          }
        />

        <RcTable headers={headers} rows={rows} />

        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
          <MenuItem onClick={handleEdit}>Edit</MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            Delete
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
}