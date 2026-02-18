'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import AlertComponent from '../../../core/components/Alert';
import { RepoItem, JsonObject } from '../../../core/types/commonTypes';
import type { DecisionGraphType } from '@gorules/jdm-editor';
import Editor from './Editor';
import { rulesApi } from 'app/src/modules/rules/api/rulesApi';
import { projectsApi } from 'app/src/modules/hub/api/projectsApi';
import { executionApi } from 'app/src/modules/JdmEditorPage/api/executionApi';
import RepositorySidebar from './RepositorySidebar';

/* ---------- Same helper functions as ProjectRuleComponent ---------- */
const splitPath = (path: string): string[] => path.split('/').filter(Boolean);
const parentOfPath = (path: string): string =>
  splitPath(path).slice(0, -1).join('/');

/* ---------- Build tree from flat rules (same logic as ProjectRuleComponent) ---------- */
const buildTreeStructure = (rules: { rule_key: string; name: string; directory?: string }[]): RepoItem[] => {
  const folderMap = new Map<string, RepoItem>();
  const rootItems: RepoItem[] = [];

  // Step 1: Create ALL folders from rule directory paths
  rules.forEach((rule) => {
    if (!rule.directory) return;

    const parts = splitPath(rule.directory);

    for (let i = 1; i < parts.length; i++) {
      const folderPath = parts.slice(0, i).join('/');

      if (!folderMap.has(folderPath)) {
        folderMap.set(folderPath, {
          id: `folder::${folderPath}`,  // Unique string ID for folders
          name: parts[i - 1],
          type: 'folder',
          path: folderPath,
          parentPath: i > 1 ? parts.slice(0, i - 1).join('/') : '',
          children: [],
        });
      }
    }
  });

  // Step 2: Build folder hierarchy (nest folders inside their parents)
  folderMap.forEach((folder) => {
    if (folder.parentPath) {
      const parent = folderMap.get(folder.parentPath);
      if (parent?.children) {
        parent.children.push(folder);
      }
    } else {
      rootItems.push(folder);
    }
  });

  // Step 3: Add files to their parent folders
  rules.forEach((rule) => {
    const fileItem: RepoItem = {
      id: rule.rule_key,
      name: rule.name,
      type: 'file',
      path: rule.directory || `rule/${rule.name}`,
      parentPath: parentOfPath(rule.directory || `rule/${rule.name}`),
    };

    if (fileItem.parentPath) {
      const parent = folderMap.get(fileItem.parentPath);
      if (parent?.children) {
        parent.children.push(fileItem);
      }
    } else {
      rootItems.push(fileItem);
    }
  });

  // Step 4: Sort folders first, then files, both alphabetically
  const sortItems = (items: RepoItem[]) => {
    items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
    items.forEach((item) => {
      if (item.children) sortItems(item.children);
    });
  };

  sortItems(rootItems);
  return rootItems;
};

export default function JdmEditorWithSimulator() {
  const { project_key, vertical_Key } = useParams<{
    project_key: string;
    vertical_Key: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [items, setItems] = useState<RepoItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [openFiles, setOpenFiles] = useState<(string | number)[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string | number>>(new Set());
  const [projectName, setProjectName] = useState<string>('');

  /* ---------- Fetch project name ---------- */
  useEffect(() => {
    if (!project_key) return;

    const fetchProject = async () => {
      try {
        const projects = await projectsApi.getProjectsView(vertical_Key!);
        const project = projects.find((p) => p.project_key === project_key);
        if (project?.name) setProjectName(project.name);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [project_key, vertical_Key]);

  /* ---------- Fetch rules and build tree ---------- */
  useEffect(() => {
    if (!project_key) return;

    const fetchRules = async () => {
      try {
        const data = await rulesApi.getProjectRules(project_key);

        // Build tree (same logic as ProjectRuleComponent)
        const treeItems = buildTreeStructure(data);
        setItems(treeItems);

        // Auto-expand ALL folders so tree is fully open by default
        const allFolderIds = new Set<string | number>();
        const collectFolderIds = (items: RepoItem[]) => {
          items.forEach((item) => {
            if (item.type === 'folder') {
              allFolderIds.add(item.id);
              if (item.children) collectFolderIds(item.children);
            }
          });
        };
        collectFolderIds(treeItems);
        setExpandedFolders(allFolderIds);

        // Auto-select rule from URL or sessionStorage
        const ruleFromUrl = searchParams.get('rule');
        const ruleIdToSelect = ruleFromUrl || sessionStorage.getItem('activeRuleId');

        if (ruleIdToSelect) {
          // Recursively find the rule in the tree
          const findRule = (items: RepoItem[]): RepoItem | null => {
            for (const item of items) {
              if (item.type === 'file' && String(item.id) === ruleIdToSelect) {
                return item;
              }
              if (item.children) {
                const found = findRule(item.children);
                if (found) return found;
              }
            }
            return null;
          };

          const foundRule = findRule(treeItems);
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

  /* ---------- Handlers ---------- */
  const handleSelectItem = (item: RepoItem) => {
    if (item.type === 'file') {
      setSelectedId(item.id);
      if (!openFiles.includes(item.id)) {
        setOpenFiles([...openFiles, item.id]);
      }
      sessionStorage.setItem('activeRuleId', String(item.id));
      sessionStorage.setItem('activeRuleName', item.name);
      navigate(
        `/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules/editor?rule=${encodeURIComponent(String(item.id))}`,
        { replace: true }
      );
    }
  };

  const handleToggleFolder = (id: string | number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /* ---------- Simulator ---------- */
  const handleSimulatorRun = async (jdm: DecisionGraphType, context: JsonObject) => {
    try {
      const result = await executionApi.execute(jdm, context);
      return result;
    } catch (error) {
      console.error('Error executing simulation:', error);
      throw error;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        p: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: 'calc(100vh - 32px)',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
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
            onDragStart={() => {}}
            onDropOnFolder={() => {}}
            onBackClick={() => {
              if (project_key) {
                navigate(
                  `/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules`
                );
              }
            }}
          />
        </Box>

        {/* Editor */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Editor
            items={items}
            selectedId={selectedId}
            openFiles={openFiles}
            setOpenFiles={setOpenFiles}
            onSimulatorRun={handleSimulatorRun}
          />
        </Box>
      </Box>

      <AlertComponent />
    </Box>
  );
}