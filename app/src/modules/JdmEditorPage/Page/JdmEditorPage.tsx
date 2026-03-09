'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ChatIcon from '@mui/icons-material/Chat';
import type { DecisionGraphType } from '@gorules/jdm-editor';
import Editor from '@/modules/JdmEditorPage/components/Editor';
import { rulesApi } from '@/modules/rules/api/rulesApi';
import { executionApi } from '@/modules/JdmEditorPage/api/executionApi';
import RepositorySidebar from '@/modules/JdmEditorPage/components/RepositorySidebar';
import { RepoItem } from '@/modules/JdmEditorPage/types/JdmEditorTypes';
import RcAlertComponent from '@/core/components/RcAlertComponent';
import { useRole } from '@/modules/auth/hooks/useRole';
import { JsonObject } from '@/modules/JdmEditorPage/types/jdmEditorEndpointsTypes';
import ChatUI from '../components/ChatUI';
import { brmsTheme } from '@/core/theme/brmsTheme';

/* ---------- Same helper functions as ProjectRuleComponent ---------- */
const splitPath = (path: string): string[] => path.split('/').filter(Boolean);
const parentOfPath = (path: string): string =>
  splitPath(path).slice(0, -1).join('/');

/* ---------- Build tree from flat rules ---------- */
const buildTreeStructure = (rules: { rule_key: string; name: string; directory?: string }[]): RepoItem[] => {
  const folderMap = new Map<string, RepoItem>();
  const rootItems: RepoItem[] = [];

  rules.forEach((rule) => {
    if (!rule.directory) return;
    const parts = splitPath(rule.directory);
    for (let i = 1; i < parts.length; i++) {
      const folderPath = parts.slice(0, i).join('/');
      if (!folderMap.has(folderPath)) {
        folderMap.set(folderPath, {
          id: `folder::${folderPath}`,
          name: parts[i - 1],
          type: 'folder',
          path: folderPath,
          parentPath: i > 1 ? parts.slice(0, i - 1).join('/') : '',
          children: [],
        });
      }
    }
  });

  folderMap.forEach((folder) => {
    if (folder.parentPath) {
      const parent = folderMap.get(folder.parentPath);
      if (parent?.children) parent.children.push(folder);
    } else {
      rootItems.push(folder);
    }
  });

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
      if (parent?.children) parent.children.push(fileItem);
    } else {
      rootItems.push(fileItem);
    }
  });

  const sortItems = (items: RepoItem[]) => {
    items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return (a.name ?? '').localeCompare(b.name ?? '');
    });
    items.forEach((item) => { if (item.children) sortItems(item.children); });
  };

  sortItems(rootItems);
  return rootItems;
};

export default function JdmEditorPage() {
  const { project_key, vertical_Key } = useParams<{
    project_key: string;
    vertical_Key: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isReviewer, isViewer } = useRole();

  const [items, setItems]                     = useState<RepoItem[]>([]);
  const [selectedId, setSelectedId]           = useState<string | number | null>(null);
  const [openFiles, setOpenFiles]             = useState<(string | number)[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string | number>>(new Set());
  const [projectName, setProjectName]         = useState<string>('');
  const [activePanel, setActivePanel]         = useState<'sidebar' | 'chat'>('sidebar');
  const [panelWidth, setPanelWidth]           = useState<number>(380);
  const [isDragging, setIsDragging]           = useState(false);

  /* ---------- Fetch rules, project name, and build tree — ONE call ---------- */
  useEffect(() => {
    if (!project_key || !vertical_Key) return;

    const fetchRules = async () => {
      try {
        const { project_name, rules } = await rulesApi.getProjectRules(project_key, vertical_Key);

        if (project_name) setProjectName(project_name);

        const activeRules = rules.filter((r) => r.status?.toUpperCase() !== 'DELETED');

        const treeItems = buildTreeStructure(activeRules);
        setItems(treeItems);

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

        const ruleFromUrl    = searchParams.get('rule');
        const ruleIdToSelect = ruleFromUrl || sessionStorage.getItem('activeRuleId');

        if (ruleIdToSelect) {
          const findRule = (items: RepoItem[]): RepoItem | null => {
            for (const item of items) {
              if (item.type === 'file' && String(item.id) === ruleIdToSelect) return item;
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
  }, [project_key, vertical_Key, searchParams]);

  /* ---------- Handlers ---------- */
  const handleSelectItem = (item: RepoItem) => {
    if (item.type === 'file') {
      setSelectedId(item.id);
      if (!openFiles.includes(item.id)) setOpenFiles([...openFiles, item.id]);
      sessionStorage.setItem('activeRuleId', String(item.id));
      sessionStorage.setItem('activeRuleName', item.name);
      navigate(
        `/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules/editor?rule=${encodeURIComponent(String(item.id))}`,
        { replace: true },
      );
    }
  };

  const handleToggleFolder = (id: string | number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  /* ---------- Simulator ---------- */
  const handleSimulatorRun = async (jdm: DecisionGraphType, context: JsonObject) => {
    try {
      return await executionApi.execute(jdm, context);
    } catch (error) {
      console.error('Error executing simulation:', error);
      throw error;
    }
  };

  /* ---------- Draggable Panel Resize ---------- */
  const handleDividerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only trigger resize if clicking directly on the divider, prevent propagation from sidebar
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Only update width if we're actually dragging on the divider
      const newWidth = Math.max(250, Math.min(800, e.clientX - 55)); // icon bar is 55px
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      // Add document listeners to track drag even outside the component
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Prevent any other drag operations while resizing
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'auto';
    };
  }, [isDragging]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: brmsTheme.colors.bgGrayLighter, p: 2 }}>
      <Box sx={{ display: 'flex', width: '100%', height: 'calc(100vh - 32px)', backgroundColor: brmsTheme.colors.white, borderRadius: '12px', boxShadow: `0 4px 20px ${brmsTheme.colors.shadowMedium}, 0 1px 3px ${brmsTheme.colors.shadowLighter}`, overflow: 'hidden' }}>

        {/* Activity Bar - Icon Only (Light Theme) */}
        <Stack
          direction="column"
          spacing={0}
          sx={{
            width: '55px',
            backgroundColor: '#f9fafb',
            borderRight: '1px solid #e5e7eb',
            alignItems: 'center',
            py: 2,
            gap: 1,
          }}
        >
          <Tooltip title="File Explorer" placement="right">
            <IconButton
              onClick={() => setActivePanel('sidebar')}
              sx={{
                color: activePanel === 'sidebar' ? '#6552D0' : '#9ca3af',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderLeft: activePanel === 'sidebar' ? '3px solid #6552D0' : '3px solid transparent',
                borderRadius: 0,
                transition: 'all 0.3s ease',
                marginLeft: '-3px',
                '&:hover': {
                  color: '#6552D0',
                  backgroundColor: '#f3f0ff',
                },
              }}
            >
              <FolderOpenIcon sx={{ fontSize: '1.5rem' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Chat Assistant" placement="right">
            <IconButton
              onClick={() => setActivePanel('chat')}
              sx={{
                color: activePanel === 'chat' ? '#6552D0' : '#9ca3af',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderLeft: activePanel === 'chat' ? '3px solid #6552D0' : '3px solid transparent',
                borderRadius: 0,
                transition: 'all 0.3s ease',
                marginLeft: '-3px',
                '&:hover': {
                  color: '#6552D0',
                  backgroundColor: '#f3f0ff',
                },
              }}
            >
              <ChatIcon sx={{ fontSize: '1.5rem' }} />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Main Panel - Shows Sidebar or Chat */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
            width: `${panelWidth}px`,
            overflow: 'hidden',
            transition: isDragging ? 'none' : 'width 0.2s ease',
          }}
        >
          {/* Sidebar Content */}
          {activePanel === 'sidebar' && (
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
                if (project_key) navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules`);
              }}
            />
          )}

          {/* Chat Content */}
          {activePanel === 'chat' && <ChatUI selectedRule={selectedId} />}
        </Box>

        {/* Draggable Divider */}
        <Box
          onMouseDown={handleDividerMouseDown}
          sx={{
            width: '4px',
            backgroundColor: isDragging ? '#6552D0' : '#e5e7eb',
            cursor: isDragging ? 'col-resize' : 'col-resize',
            transition: isDragging ? 'none' : 'backgroundColor 0.2s ease',
            userSelect: 'none',
            flexShrink: 0,
            '&:hover': {
              backgroundColor: '#6552D0',
            },
            '&:active': {
              backgroundColor: '#6552D0',
            },
          }}
        />

        {/* Editor */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Editor
            items={items}
            selectedId={selectedId}
            openFiles={openFiles}
            setOpenFiles={setOpenFiles}
            onSimulatorRun={handleSimulatorRun}
            isReviewer={isReviewer || isViewer}
          />
        </Box>
      </Box>

      <RcAlertComponent />
    </Box>
  );
}


