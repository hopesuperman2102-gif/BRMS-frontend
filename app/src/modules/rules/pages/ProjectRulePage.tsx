'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { rulesApi } from 'app/src/modules/rules/api/rulesApi';
import { Breadcrumb, ExplorerItem, FileNode, FolderNode } from '../types/Explorertypes';
import RcConfirmDialog from 'app/src/core/components/RcConfirmDailog';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { ConfirmDialogState, RuleResponse } from '../types/rulesTypes';
import RulesRightPanel from '../components/RulesRightPanel';
import RulesLeftPanel from '../components/Rulesleftpanel';
import RcAlertComponent, { useAlertStore } from 'app/src/core/components/RcAlertComponent';

const { colors, fonts } = brmsTheme;

/* ─── Helpers ─────────────────────────────────────────────── */
export const splitPath    = (path: string): string[] => path.split('/').filter(Boolean);
export const parentOfPath = (path: string): string => splitPath(path).slice(0, -1).join('/');
export const fmtDate      = (iso: string): string => {
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return iso ?? '—'; }
};

/* ─── Styled — mirrors HubPage header exactly ─────────────── */

const HeaderWrapper = styled(Box)({
  paddingLeft: '24px',
  paddingRight: '24px',
  paddingTop: '16px',
  paddingBottom: '16px',
});

const BackRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const BackButton = styled(IconButton)({
  width: 36,
  height: 36,
  borderRadius: '10px',
  backgroundColor: colors.primaryGlowSoft,
  color: colors.primary,
  transition: 'all 0.2s',
  flexShrink: 0,
  '&:hover': {
    backgroundColor: colors.primaryGlowMid,
    transform: 'translateX(-2px)',
  },
});

const VerticalNameText = styled(Typography)({
  fontSize: '0.95rem',
  fontWeight: 600,
  color: colors.navTextHigh,
  whiteSpace: 'nowrap',
});

const SeparatorText = styled(Typography)({
  fontSize: '0.95rem',
  color: colors.lightTextLow,
  lineHeight: 1,
});

const ProjectNameText = styled(Typography)({
  fontSize: '0.95rem',
  fontWeight: 700,
  color: colors.navTextHigh,
  whiteSpace: 'nowrap',
});

/* ── Panel container — height accounts for header ── */
const RootWrapper = styled(Box)({
  width: '100%',
  display: 'flex',
  borderRadius: '16px',
  overflow: 'hidden',
  border: `1px solid ${colors.panelBorder}`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  fontFamily: fonts.sans,
  /* 64px top nav + 16px pt + ~48px header row + 16px pb = ~144px */
  height: 'calc(100vh - 144px)',
});

/* ─── Page ────────────────────────────────────────────────── */
export default function ProjectRulePage() {
  const { project_key, vertical_Key } = useParams<{ project_key: string; vertical_Key: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlertStore();

  const [projectName, setProjectName]   = useState('');
  const [verticalName, setVerticalName] = useState('');
  const [folders, setFolders]           = useState<FolderNode[]>([]);
  const [files, setFiles]               = useState<FileNode[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPath, setCurrentPath]   = useState('');
  const [breadcrumbs, setBreadcrumbs]   = useState<Breadcrumb[]>([{ name: 'Home', path: '' }]);

  const [anchorEl, setAnchorEl]           = useState<HTMLElement | null>(null);
  const [menuItem, setMenuItem]           = useState<ExplorerItem | null>(null);
  const [newMenuAnchor, setNewMenuAnchor] = useState<HTMLElement | null>(null);

  const [editingFolderId, setEditingFolderId]     = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [refetchTrigger, setRefetchTrigger]       = useState(0);
  const [hoveredRule, setHoveredRule]             = useState<FileNode | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false, title: '', message: '', confirmText: 'Delete', onConfirm: () => {},
  });
  const closeConfirmDialog = () => setConfirmDialog((p) => ({ ...p, open: false }));

  /* ── Build tree ───────────────────────────────────────── */
  const buildTree = useCallback((rules: RuleResponse[]) => {
    const folderMap = new Map<string, FolderNode>();
    rules.forEach((rule) => {
      if (!rule.directory) return;
      const parts = splitPath(rule.directory);
      for (let i = 1; i < parts.length; i++) {
        const folderPath = parts.slice(0, i).join('/');
        if (!folderMap.has(folderPath)) {
          folderMap.set(folderPath, {
            kind: 'folder', path: folderPath, name: parts[i - 1],
            parentPath: i > 1 ? parts.slice(0, i - 1).join('/') : '',
          });
        }
      }
    });
    setFolders((prev) => [...Array.from(folderMap.values()), ...prev.filter((f) => f.isTemp)]);
    setFiles(rules.map((r) => ({
      kind: 'file' as const,
      rule_key:    r.rule_key,
      name:        r.name ?? '',
      path:        r.directory || r.name,
      parentPath:  parentOfPath(r.directory || r.name),
      status:      r.status ?? 'DRAFT',
      version:     r.version ?? '—',
      updatedAt:   r.updated_at ?? '',
      description: r.description ?? '',
    })));
  }, []);

  /* ── URL path init ────────────────────────────────────── */
  const didInitFromUrl = useRef(false);
  useEffect(() => {
    if (didInitFromUrl.current) return;
    didInitFromUrl.current = true;
    const pathFromUrl = searchParams.get('path');
    if (!pathFromUrl) return;
    const parts = splitPath(pathFromUrl);
    const crumbs: Breadcrumb[] = [{ name: 'Home', path: '' }];
    for (let i = 0; i < parts.length; i++) {
      crumbs.push({ name: parts[i], path: parts.slice(0, i + 1).join('/') });
    }
    setCurrentPath(pathFromUrl);
    setBreadcrumbs(crumbs);
    setSearchParams({}, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── API load ─────────────────────────────────────────── */
  const loadRules = useCallback(async () => {
    if (!project_key || !vertical_Key) return;
    try {
      const { vertical_name, project_name, rules } =
        await rulesApi.getProjectRules(project_key, vertical_Key);
      if (vertical_name) setVerticalName(vertical_name);
      if (project_name)  setProjectName(project_name);
      buildTree(rules.filter((r) => r.status?.toUpperCase() !== 'DELETED'));
    } catch (err) { console.error('Error loading rules:', err); }
  }, [project_key, vertical_Key, buildTree]);

  useEffect(() => { void loadRules(); }, [loadRules, refetchTrigger]);

  /* ── Visible items ────────────────────────────────────── */
  const visibleItems: ExplorerItem[] = [
    ...folders.filter((f) => f.parentPath === currentPath),
    ...files.filter((f) => f.parentPath === currentPath),
  ].sort((a, b) => {
    if (a.kind === 'folder' && b.kind !== 'folder') return -1;
    if (a.kind !== 'folder' && b.kind === 'folder') return 1;
    return (a.name ?? '').localeCompare(b.name ?? '');
  });

  /* ── Navigation ───────────────────────────────────────── */
  const openFolder = (folder: FolderNode) => {
    if (editingFolderId === folder.path) return;
    setCurrentPath(folder.path);
    setBreadcrumbs((prev) => [...prev, { path: folder.path, name: folder.name }]);
  };
  const navigateToBreadcrumb = (entry: Breadcrumb) => {
    setCurrentPath(entry.path);
    setBreadcrumbs((prev) => prev.slice(0, prev.findIndex((b) => b.path === entry.path) + 1));
  };

  /* ── Context Menu ─────────────────────────────────────── */
  const openMenu  = (e: React.MouseEvent<HTMLElement>, item: ExplorerItem) => {
    e.stopPropagation(); setAnchorEl(e.currentTarget); setMenuItem(item);
  };
  const closeMenu = () => { setAnchorEl(null); setMenuItem(null); };

  /* ── Delete ───────────────────────────────────────────── */
  const executeDelete = async (item: ExplorerItem) => {
    try {
      if (item.kind === 'file') {
        await rulesApi.deleteRule(item.rule_key);
        setRefetchTrigger((n) => n + 1);
      } else {
        const inside = files.filter((f) => f.path.startsWith(item.path + '/'));
        if (inside.length === 0) {
          setFolders((prev) => prev.filter((f) => !f.path.startsWith(item.path)));
        } else {
          await Promise.all(inside.map((r) => rulesApi.deleteRule(r.rule_key)));
          setRefetchTrigger((n) => n + 1);
        }
      }
    } catch (err) { console.error('Failed to delete:', err); }
    closeConfirmDialog();
  };

  const handleDelete = () => {
    if (!menuItem) return;
    const item = menuItem;
    closeMenu();
    if (item.kind === 'file') {
      setConfirmDialog({
        open: true, title: 'Delete Rule',
        message: `"${item.name}" will be permanently deleted and cannot be recovered.`,
        confirmText: 'Delete Rule', onConfirm: () => executeDelete(item),
      });
    } else {
      const inside = files.filter((f) => f.path.startsWith(item.path + '/'));
      setConfirmDialog({
        open: true, title: 'Delete Folder',
        message: inside.length > 0
          ? `"${item.name}" contains ${inside.length} rule${inside.length > 1 ? 's' : ''}. Deleting this folder will permanently remove all rules inside it.`
          : `"${item.name}" will be permanently deleted.`,
        confirmText: 'Delete Folder', onConfirm: () => executeDelete(item),
      });
    }
  };

  /* ── Edit / Rename ────────────────────────────────────── */
  const handleEdit = () => {
    if (!menuItem) return;
    const item = menuItem;
    closeMenu();
    if (item.kind === 'file') {
      navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules/createrules?key=${item.rule_key}`);
    } else {
      setEditingFolderId(item.path);
      setEditingFolderName(item.name);
    }
  };

  const clearEditing = () => { setEditingFolderId(null); setEditingFolderName(''); };

  const commitFolderRename = async () => {
    if (!editingFolderId) return;
    const trimmedName = editingFolderName.trim();
    if (!trimmedName) {
      setFolders((prev) => prev.filter((f) => f.path !== editingFolderId));
      clearEditing(); return;
    }
    const folder = folders.find((f) => f.path === editingFolderId);
    if (!folder) return;
    const newFolderPath = folder.parentPath ? `${folder.parentPath}/${trimmedName}` : trimmedName;
    if (folders.some((f) => f.path === newFolderPath && f.path !== editingFolderId)) {
      showAlert(`A folder named "${trimmedName}" already exists here.`, 'error');
      setFolders((prev) => prev.filter((f) => f.path !== editingFolderId));
      clearEditing(); return;
    }
    try {
      const oldPath       = folder.path;
      const rulesToUpdate = files.filter((f) => f.path.startsWith(oldPath + '/'));
      if (rulesToUpdate.length === 0) {
        setFolders((prev) => prev.map((f) =>
          f.path === editingFolderId ? { ...f, path: newFolderPath, name: trimmedName, isTemp: false } : f
        ));
        clearEditing(); return;
      }
      await Promise.all(rulesToUpdate.map((rule) =>
        rulesApi.updateRuleDirectory({
          rule_key: rule.rule_key, updated_by: 'admin',
          directory: rule.path.replace(oldPath, newFolderPath),
        })
      ));
      setFolders((prev) => prev.map((f) => {
        if (f.path === editingFolderId) return { ...f, path: newFolderPath, name: trimmedName, isTemp: false };
        if (f.path.startsWith(oldPath + '/')) return { ...f, path: f.path.replace(oldPath, newFolderPath) };
        return f;
      }));
      setRefetchTrigger((n) => n + 1);
    } catch (err) { console.error('Failed to rename folder:', err); }
    clearEditing();
  };

  const handleFolderNameChange  = (e: React.ChangeEvent<HTMLInputElement>) => setEditingFolderName(e.target.value);
  const handleFolderNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter')  void commitFolderRename();
    if (e.key === 'Escape') { setFolders((prev) => prev.filter((f) => f.path !== editingFolderId)); clearEditing(); }
  };

  /* ── Create ───────────────────────────────────────────── */
  const handleCreateNewFolder = () => {
    setNewMenuAnchor(null);
    const tempId = `__temp_${Date.now()}`;
    const path   = `${currentPath}/${tempId}`;
    setFolders((prev) => [...prev, { kind: 'folder', path, name: 'New folder', parentPath: currentPath, isTemp: true }]);
    setTimeout(() => { setEditingFolderId(path); setEditingFolderName('New folder'); }, 50);
  };

  const handleCreateNewRule = () => {
    setNewMenuAnchor(null);
    navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules/createrules?directory=${encodeURIComponent(currentPath)}`);
  };

  const handleOpenFile = (item: FileNode) => {
    sessionStorage.setItem('activeRuleName', item.name);
    sessionStorage.setItem('activeRuleId', item.rule_key);
    navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules/editor?rule=${encodeURIComponent(item.rule_key)}`);
  };

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <>
      {/* ── Header — identical markup/styles to HubPage ── */}
      <HeaderWrapper>
        <BackRow>
          <BackButton
            onClick={() => navigate(`/vertical/${vertical_Key}/dashboard/hub`)}
            disableRipple
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </BackButton>

          {verticalName && <VerticalNameText>{verticalName}</VerticalNameText>}
          {verticalName && projectName && <SeparatorText>›</SeparatorText>}
          {projectName && <ProjectNameText>{projectName}</ProjectNameText>}
        </BackRow>
      </HeaderWrapper>

      {/* ── Panels — wrapped in ContentWrapper padding like HubPage ── */}
      <Box sx={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '24px' }}>
        <RootWrapper>
          <RulesLeftPanel
            projectName={projectName}
            files={files}
            folders={folders}
            hoveredRule={hoveredRule} 
          />

          <RulesRightPanel
            projectName={projectName}
            breadcrumbs={breadcrumbs}
            visibleItems={visibleItems}
            editingFolderId={editingFolderId}
            editingFolderName={editingFolderName}
            newMenuAnchor={newMenuAnchor}
            anchorEl={anchorEl}
            onNewMenuOpen={(e) => setNewMenuAnchor(e.currentTarget)}
            onNewMenuClose={() => setNewMenuAnchor(null)}
            onCreateNewRule={handleCreateNewRule}
            onCreateNewFolder={handleCreateNewFolder}
            onNavigateToBreadcrumb={navigateToBreadcrumb}
            onOpenFolder={openFolder}
            onOpenFile={handleOpenFile}
            onMenuOpen={openMenu}
            onMenuClose={closeMenu}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onNameChange={handleFolderNameChange}
            onNameBlur={commitFolderRename}
            onNameKeyDown={handleFolderNameKeyDown}
            onMouseEnterFile={setHoveredRule}
            onMouseLeaveFile={() => setHoveredRule(null)}
            onBack={() => navigate(`/vertical/${vertical_Key}/dashboard/hub`)}
          />
        </RootWrapper>
      </Box>

      <RcConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirmDialog}
      />
      <RcAlertComponent />
    </>
  );
}