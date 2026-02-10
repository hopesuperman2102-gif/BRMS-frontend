'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import AlertComponent from '../../../core/components/Alert';
import { RepoItem } from '../../../core/types/commonTypes';
import Editor from './Editor';
import { rulesApi } from 'app/src/api/rulesApi';
import { projectsApi } from 'app/src/api/projectsApi';
import RepositorySidebar from 'app/src/core/components/RepositorySidebar';

export default function JdmEditorWithSimulator() {
  const { project_key } = useParams<{ project_key: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [items, setItems] = useState<RepoItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openFiles, setOpenFiles] = useState<number[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [draggedItem, setDraggedItem] = useState<RepoItem | null>(null);
  const [projectName, setProjectName] = useState<string>('');

  /* ---------- Fetch project name ---------- */
  useEffect(() => {
    if (!project_key) return;

    const fetchProject = async () => {
      try {
        const projects = await projectsApi.getProjectsView();
        const project = projects.find(
          (p: any) => p.project_key === project_key
        );
        if (project?.name) setProjectName(project.name);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [project_key]);

  /* ---------- Fetch rules list only (without graph data) ---------- */
  useEffect(() => {
    if (!project_key) return;

    const fetchRules = async () => {
      try {
        const data = await rulesApi.getProjectRules(project_key);

        // Don't load graph here - just basic info
        const treeItems: RepoItem[] = data.map((rule: any) => ({
          id: rule.rule_key,
          name: rule.name,
          type: 'file' as const,
          graph: {}, // Empty graph initially
        }));

        setItems(treeItems);

        // Check URL parameter first, then sessionStorage
        const ruleFromUrl = searchParams.get('rule');
        const ruleIdToSelect = ruleFromUrl || sessionStorage.getItem('activeRuleId');
        
        if (ruleIdToSelect) {
          const foundRule = treeItems.find((item) => String(item.id) === ruleIdToSelect);
          if (foundRule) {
            setSelectedId(foundRule.id);
            setOpenFiles([foundRule.id]);
            sessionStorage.setItem('activeRuleId', String(foundRule.id));
            sessionStorage.setItem('activeRuleName', foundRule.name);
          }
        }
      } catch (error) {
        console.error('Error fetching rules:', error);
      }
    };

    fetchRules();
  }, [project_key, searchParams]);

  const handleSelectItem = (item: RepoItem) => {
    if (item.type === 'file') {
      setSelectedId(item.id);
      if (!openFiles.includes(item.id)) {
        setOpenFiles([...openFiles, item.id]);
      }
      // Store in sessionStorage
      sessionStorage.setItem('activeRuleId', String(item.id));
      sessionStorage.setItem('activeRuleName', item.name);
      
      // Update URL with rule parameter
      navigate(`/dashboard/${project_key}/rules/editor?rule=${item.id}`, {
        replace: true,
      });
    }
  };

  const handleToggleFolder = (id: number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDragStart = (item: RepoItem) => {
    setDraggedItem(item);
  };

  const handleDropOnFolder = (folder: RepoItem) => {
    console.log('Dropped on folder:', folder);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        height: '100vh',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 50%, #f8faff 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 30%, rgba(101, 82, 208, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(23, 32, 61, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <RepositorySidebar
        projectName={projectName}
        items={items}
        selectedId={selectedId}
        expandedFolders={expandedFolders}
        onToggleFolder={handleToggleFolder}
        onSelectItem={handleSelectItem}
        onAddClick={() => {}}
        onDragStart={handleDragStart}
        onDropOnFolder={handleDropOnFolder}
        onBackClick={() => {
          if (project_key) {
            navigate(`/dashboard/${project_key}/rules`);
          }
        }}
      />

      <Editor
        items={items}
        selectedId={selectedId}
        openFiles={openFiles}
        setOpenFiles={setOpenFiles}
      />

      <AlertComponent />
    </Box>
  );
}
