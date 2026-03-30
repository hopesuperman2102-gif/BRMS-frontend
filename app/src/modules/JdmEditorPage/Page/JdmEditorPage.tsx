'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { DecisionGraphType } from '@gorules/jdm-editor';
import Editor from '@/modules/JdmEditorPage/components/Editor';
import { rulesApi } from '@/modules/rules/api/rulesApi';
import { executionApi } from '@/modules/JdmEditorPage/api/executionApi';
import RepositorySidebar from '@/modules/JdmEditorPage/components/RepositorySidebar';
import { RepoItem } from '@/modules/JdmEditorPage/types/JdmEditorTypes';
import RcAlertComponent from '@/core/components/RcAlertComponent';
import { useRole } from '@/modules/auth/hooks/useRole';
import { JsonObject } from '@/modules/JdmEditorPage/types/jdmEditorEndpointsTypes';
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

const PageWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: brmsTheme.colors.bgGrayLighter,
  padding: 16,
});

const EditorCard = styled(Box)({
  display: 'flex',
  width: '100%',
  height: 'calc(100vh - 32px)',
  backgroundColor: brmsTheme.colors.white,
  borderRadius: '12px',
  boxShadow: `0 4px 20px ${brmsTheme.colors.shadowMedium}, 0 1px 3px ${brmsTheme.colors.shadowLighter}`,
  overflow: 'hidden',
});

const SidebarWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${brmsTheme.colors.lightBorder}`,
  backgroundColor: brmsTheme.colors.white,
});

const EditorWrapper = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

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

  return (
    <PageWrapper>
      <EditorCard>

        {/* Sidebar */}
        <SidebarWrapper>
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
        </SidebarWrapper>

        {/* Editor */}
        <EditorWrapper>
          <Editor
            items={items}
            selectedId={selectedId}
            openFiles={openFiles}
            setOpenFiles={setOpenFiles}
            onSimulatorRun={handleSimulatorRun}
            isReviewer={isReviewer || isViewer}
          />
        </EditorWrapper>

      </EditorCard>

      <RcAlertComponent />
    </PageWrapper>
  );
}