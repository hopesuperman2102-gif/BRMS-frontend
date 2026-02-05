'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Box } from '@mui/material';
import AlertComponent from '../../../core/components/Alert';
import { RepoItem } from '../../../core/types/commonTypes';
import Editor from './Editor';
import { rulesApi } from 'app/src/api/rulesApi';
import { projectsApi } from 'app/src/api/projectsApi';
import RepositorySidebar from 'app/src/core/components/RepositorySidebar';

export default function JdmEditorWithSimulator() {
  const { project_key } = useParams<{ project_key: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ruleIdFromUrl = searchParams.get('rule');

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
      const projects = await projectsApi.getProjectsView();
      const project = projects.find(
        (p: any) => p.project_key === project_key
      );
      if (project?.name) setProjectName(project.name);
    };

    fetchProject();
  }, [project_key]);

  /* ---------- Fetch rules ---------- */
  useEffect(() => {
    if (!project_key) return;

    const fetchRules = async () => {
      const data = await rulesApi.getProjectRules(project_key);

      const treeItems: RepoItem[] = data.map((rule: any) => ({
        id: rule.rule_key,
        name: rule.name,
        type: 'file' as const,
        graph: rule.graph || {},
      }));

      setItems(treeItems);

      // Auto-select rule from URL
      if (ruleIdFromUrl) {
        const foundRule = treeItems.find((item) => String(item.id) === ruleIdFromUrl);
        if (foundRule) {
          setSelectedId(foundRule.id);
          setOpenFiles([foundRule.id]);
        }
      }
    };

    fetchRules();
  }, [project_key, ruleIdFromUrl]);

  const handleSelectItem = (item: RepoItem) => {
    if (item.type === 'file') {
      setSelectedId(item.id);
      if (!openFiles.includes(item.id)) {
        setOpenFiles([...openFiles, item.id]);
      }
      // Update URL
      router.push(`/dashboard/${project_key}/rules/editor?rule=${item.id}`);
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
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#e5e9f7' }}>
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