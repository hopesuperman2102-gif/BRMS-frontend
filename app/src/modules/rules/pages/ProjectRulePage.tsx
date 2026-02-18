'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Button, Skeleton,
  IconButton, Menu, MenuItem, Breadcrumbs, Link, Divider,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { rulesApi, RuleResponse } from 'app/src/modules/rules/api/rulesApi';
import { projectsApi } from 'app/src/modules/hub/api/projectsApi';
import { verticalsApi } from '../../vertical/api/verticalsApi';
import { Breadcrumb, ExplorerItem, FileNode, FolderNode, ProjectResponse } from '../types/Explorertypes';
import { FileCard } from '../components/FileCard';
import { FolderCard } from '../components/FolderCard';

import RcConfirmDialog from 'app/src/core/components/RcConfirmDailog';
import { RulesLeftPanel } from './Rulesleftpanel';
import { ExplorerEmptyState } from '../components/Exploreremptystate';

/* ─── Design Tokens ───────────────────────────────────────── */
const T = {
  indigo:      '#4F46E5',
  indigoHover: '#4338CA',
  indigoMuted: 'rgba(79,70,229,0.08)',
  bgRight:     '#F7F8FA',
  lTextHigh:   '#0F172A',
  lTextMid:    '#475569',
  lTextLow:    '#94A3B8',
  lBorder:     '#E2E8F0',
  dBorder:     'rgba(255,255,255,0.06)',
};

/* ─── Helpers ─────────────────────────────────────────────── */
export const splitPath = (path: string): string[] => path.split('/').filter(Boolean);
export const parentOfPath = (path: string): string => splitPath(path).slice(0, -1).join('/');
export const fmtDate = (iso: string): string => {
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return iso ?? '—'; }
};

interface ConfirmDialogState {
  open: boolean; title: string; message: string; confirmText: string; onConfirm: () => void;
}

/* ─── Page ────────────────────────────────────────────────── */
export default function ProjectRulePage() {
  const { project_key, vertical_Key } = useParams<{ project_key: string; vertical_Key: string }>();
  const navigate = useNavigate();

  const [projectName, setProjectName]   = useState<string>('');
  const [verticalName, setVerticalName] = useState<string>('');
  const [folders, setFolders]           = useState<FolderNode[]>([]);
  const [files, setFiles]               = useState<FileNode[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPath, setCurrentPath]   = useState<string>('rule');
  const [breadcrumbs, setBreadcrumbs]   = useState<Breadcrumb[]>([{ name: 'Rules', path: 'rule' }]);

  const [anchorEl, setAnchorEl]           = useState<HTMLElement | null>(null);
  const [menuItem, setMenuItem]           = useState<ExplorerItem | null>(null);
  const [newMenuAnchor, setNewMenuAnchor] = useState<HTMLElement | null>(null);

  const [editingFolderId, setEditingFolderId]     = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [refetchTrigger, setRefetchTrigger]       = useState(0);
  const [hoveredRule, setHoveredRule]           = useState<FileNode | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({ open: false, title: '', message: '', confirmText: 'Delete', onConfirm: () => {} });
  const closeConfirmDialog = () => setConfirmDialog((prev) => ({ ...prev, open: false }));

  /* Build tree */
  const buildTree = useCallback((rules: RuleResponse[]) => {
    const folderMap = new Map<string, FolderNode>();
    rules.forEach((rule) => {
      if (!rule.directory) return;
      const parts = splitPath(rule.directory);
      for (let i = 1; i < parts.length; i++) {
        const folderPath = parts.slice(0, i).join('/');
        if (!folderMap.has(folderPath)) {
          folderMap.set(folderPath, { kind: 'folder', path: folderPath, name: parts[i - 1], parentPath: i > 1 ? parts.slice(0, i - 1).join('/') : '' });
        }
      }
    });
    setFolders((prev) => [...Array.from(folderMap.values()), ...prev.filter((f) => f.isTemp)]);
    setFiles(rules.map((r) => ({ kind: 'file', rule_key: r.rule_key, name: r.name, path: r.directory || `rule/${r.name}`, parentPath: parentOfPath(r.directory || `rule/${r.name}`), status: r.status, version: r.version ?? '—', updatedAt: r.updated_at, description: r.description })));
  }, []);

  /* URL path init */
  const didInitFromUrl = useRef(false);
  useEffect(() => {
    if (didInitFromUrl.current) return;
    didInitFromUrl.current = true;
    const pathFromUrl = searchParams.get('path');
    if (!pathFromUrl) return;
    const parts = splitPath(pathFromUrl);
    const crumbs: Breadcrumb[] = [{ name: 'Rules', path: 'rule' }];
    for (let i = 1; i < parts.length; i++) crumbs.push({ name: parts[i], path: parts.slice(0, i + 1).join('/') });
    setCurrentPath(pathFromUrl);
    setBreadcrumbs(crumbs);
    setSearchParams({}, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Fetch names */
  useEffect(() => {
    if (!vertical_Key) return;
    verticalsApi.getVerticalsView()
      .then((v) => { const m = v.find((x) => x.vertical_key === vertical_Key); if (m) setVerticalName(m.vertical_name); })
      .catch((e: unknown) => console.error(e));
  }, [vertical_Key]);

  useEffect(() => {
    if (!project_key) return;
    projectsApi.getProjectsView(vertical_Key!)
      .then((p: ProjectResponse[]) => { const m = p.find((x) => x.project_key === project_key); if (m?.name) setProjectName(m.name); })
      .catch((e: unknown) => console.error(e));
  }, [project_key, vertical_Key]);

  /* Load rules */
  const loadRules = useCallback(async () => {
    if (!project_key) return;
    try {
      const rulesData = await rulesApi.getProjectRules(project_key);
      const enriched = await Promise.all(rulesData.map(async (r: RuleResponse) => {
        try { const versions = await rulesApi.getRuleVersions(r.rule_key); return { ...r, version: versions?.[0]?.version ?? 'Unversioned' }; }
        catch { return { ...r, version: '—' }; }
      }));
      buildTree(enriched);
    } catch (err) { console.error('Error loading rules:', err); }
  }, [project_key, buildTree]);

  useEffect(() => { void loadRules(); }, [loadRules, refetchTrigger]);

  /* Visible items */
  const visibleItems: ExplorerItem[] = [
    ...folders.filter((f) => f.parentPath === currentPath),
    ...files.filter((f) => f.parentPath === currentPath),
  ].sort((a, b) => {
    if (a.kind === 'folder' && b.kind !== 'folder') return -1;
    if (a.kind !== 'folder' && b.kind === 'folder') return 1;
    return a.name.localeCompare(b.name);
  });

  /* Navigation */
  const openFolder = (folder: FolderNode) => {
    if (editingFolderId === folder.path) return;
    setCurrentPath(folder.path);
    setBreadcrumbs((prev) => [...prev, { path: folder.path, name: folder.name }]);
  };
  const navigateToBreadcrumb = (entry: Breadcrumb) => {
    setCurrentPath(entry.path);
    setBreadcrumbs((prev) => prev.slice(0, prev.findIndex((b) => b.path === entry.path) + 1));
  };

  /* Menu */
  const openMenu = (e: React.MouseEvent<HTMLElement>, item: ExplorerItem) => { e.stopPropagation(); setAnchorEl(e.currentTarget); setMenuItem(item); };
  const closeMenu = () => { setAnchorEl(null); setMenuItem(null); };

  /* Delete */
  const executeDelete = async (item: ExplorerItem) => {
    try {
      if (item.kind === 'file') { await rulesApi.deleteRule(item.rule_key); setRefetchTrigger((n) => n + 1); }
      else {
        const inside = files.filter((f) => f.path.startsWith(item.path + '/'));
        if (inside.length === 0) { setFolders((prev) => prev.filter((f) => f.path !== item.path)); }
        else { await Promise.all(inside.map((r) => rulesApi.deleteRule(r.rule_key))); setRefetchTrigger((n) => n + 1); }
      }
    } catch (err) { console.error('Failed to delete:', err); }
    closeConfirmDialog();
  };

  const handleDelete = () => {
    if (!menuItem) return;
    closeMenu();
    if (menuItem.kind === 'file') {
      setConfirmDialog({ open: true, title: 'Delete Rule', message: `"${menuItem.name}" will be permanently deleted and cannot be recovered.`, confirmText: 'Delete Rule', onConfirm: () => executeDelete(menuItem) });
    } else {
      const inside = files.filter((f) => f.path.startsWith(menuItem.path + '/'));
      setConfirmDialog({ open: true, title: 'Delete Folder', message: inside.length > 0 ? `"${menuItem.name}" contains ${inside.length} rule${inside.length > 1 ? 's' : ''}. Deleting this folder will permanently remove all rules inside it.` : `"${menuItem.name}" will be permanently deleted.`, confirmText: 'Delete Folder', onConfirm: () => executeDelete(menuItem) });
    }
  };

  /* Edit/Rename */
  const handleEdit = () => {
    if (!menuItem) return;
    if (menuItem.kind === 'file') { navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules/createrules?key=${menuItem.rule_key}`); }
    else { setEditingFolderId(menuItem.path); setEditingFolderName(menuItem.name); }
    closeMenu();
  };

  const clearEditing = () => { setEditingFolderId(null); setEditingFolderName(''); };

  const commitFolderRename = async () => {
    if (!editingFolderId) return;
    const trimmedName = editingFolderName.trim();
    if (!trimmedName) { setFolders((prev) => prev.filter((f) => f.path !== editingFolderId)); clearEditing(); return; }
    const folder = folders.find((f) => f.path === editingFolderId);
    if (!folder) return;
    const newFolderPath = folder.parentPath ? `${folder.parentPath}/${trimmedName}` : trimmedName;
    if (folders.some((f) => f.path === newFolderPath && f.path !== editingFolderId)) { setFolders((prev) => prev.filter((f) => f.path !== editingFolderId)); clearEditing(); return; }
    try {
      const oldPath = folder.path;
      const rulesToUpdate = files.filter((f) => f.path.startsWith(oldPath + '/'));
      if (rulesToUpdate.length === 0) { setFolders((prev) => prev.map((f) => f.path === editingFolderId ? { ...f, path: newFolderPath, name: trimmedName, isTemp: false } : f)); clearEditing(); return; }
      await Promise.all(rulesToUpdate.map((rule) => rulesApi.updateRuleDirectory({ rule_key: rule.rule_key, updated_by: 'admin', directory: rule.path.replace(oldPath, newFolderPath) })));
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

  /* Create */
  const handleCreateNewFolder = () => {
    setNewMenuAnchor(null);
    const name = 'New folder';
    const path = `${currentPath}/${name}`;
    setFolders((prev) => [...prev, { kind: 'folder', path, name, parentPath: currentPath, isTemp: true }]);
    setEditingFolderId(path);
    setEditingFolderName(name);
  };
  const handleCreateNewRule = () => {
    setNewMenuAnchor(null);
    navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules/createrules?directory=${encodeURIComponent(currentPath)}`);
  };

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <>
      <Box sx={{ width: '100%', display: 'flex', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${T.dBorder}`, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', height: 'calc(100vh - 64px)', fontFamily: '"DM Sans", "Inter", sans-serif' }}>

        {/* ── LEFT PANEL ── */}
        <RulesLeftPanel
          projectName={projectName}
          verticalName={verticalName}
          folders={folders}
          files={files}
          currentPath={currentPath}
          hoveredRule={hoveredRule}
        />

        {/* ── RIGHT PANEL ── */}
        <Box sx={{ flex: 1, background: T.bgRight, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Top bar */}
          <Box sx={{ px: '28px', pt: '24px', pb: '16px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              {/* Accent bar */}
              <Box sx={{ width: '28px', height: '2px', borderRadius: '1px', background: T.indigo, mb: '10px' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconButton
                  size="small"
                  onClick={() => navigate(`/vertical/${vertical_Key}/dashboard/hub`)}
                  disableRipple
                  sx={{ width: 30, height: 30, borderRadius: '6px', color: T.lTextMid, border: `1px solid ${T.lBorder}`, bgcolor: '#FFFFFF', '&:hover': { borderColor: T.indigo, color: T.indigo, bgcolor: 'rgba(79,70,229,0.04)' }, transition: 'all 0.15s' }}
                >
                  <ArrowBackIcon sx={{ fontSize: 15 }} />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: T.lTextMid }}>
                    {verticalName || <Skeleton width={60} />}
                  </Typography>
                  <Typography sx={{ color: T.lTextLow, fontSize: '0.875rem', lineHeight: 1 }}>›</Typography>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: T.lTextHigh, letterSpacing: '-0.02em' }}>
                    {projectName || <Skeleton width={100} />}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* New button */}
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: '14px !important' }} />}
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '14px !important' }} />}
                onClick={(e) => setNewMenuAnchor(e.currentTarget)}
                disableRipple
                disableElevation
                sx={{ background: T.indigo, borderRadius: '6px', px: '14px', py: '8px', textTransform: 'none', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.01em', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 4px 12px rgba(79,70,229,0.20)', '&:hover': { background: T.indigoHover, boxShadow: '0 1px 3px rgba(0,0,0,0.16), 0 6px 20px rgba(79,70,229,0.28)', transform: 'translateY(-1px)' }, transition: 'all 0.15s' }}
              >
                New
              </Button>
              <Menu
                anchorEl={newMenuAnchor} open={!!newMenuAnchor} onClose={() => setNewMenuAnchor(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={{ '& .MuiPaper-root': { borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', border: `1px solid ${T.lBorder}`, minWidth: '160px', mt: '6px' }, '& .MuiList-root': { py: '6px' } }}
              >
                <MenuItem onClick={handleCreateNewRule} sx={{ fontSize: '0.8125rem', fontWeight: 500, color: T.lTextHigh, mx: '6px', borderRadius: '6px', py: '9px', px: '10px', gap: '10px', '&:hover': { bgcolor: T.indigoMuted } }}>
                  <Box sx={{ width: 26, height: 26, borderRadius: '6px', background: '#F1F5F9', border: `1px solid ${T.lBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <InsertDriveFileOutlinedIcon sx={{ fontSize: 14, color: '#64748B' }} />
                  </Box>
                  New Rule
                </MenuItem>
                <MenuItem onClick={handleCreateNewFolder} sx={{ fontSize: '0.8125rem', fontWeight: 500, color: T.lTextHigh, mx: '6px', borderRadius: '6px', py: '9px', px: '10px', gap: '10px', '&:hover': { bgcolor: '#FAFAF9' } }}>
                  <Box sx={{ width: 26, height: 26, borderRadius: '6px', background: '#F8FAFC', border: `1px solid ${T.lBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                  </Box>
                  New Folder
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Breadcrumb bar */}
          <Box sx={{ mx: '28px', mb: '12px', px: '12px', py: '8px', bgcolor: '#FFFFFF', borderRadius: '8px', border: `1px solid ${T.lBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <Breadcrumbs separator={<Typography sx={{ color: T.lTextLow, fontSize: '0.75rem', mx: '2px' }}>›</Typography>}>
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                const Icon   = idx === 0 ? HomeIcon : FolderIcon;
                return isLast ? (
                  <Box key={crumb.path} sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Icon sx={{ fontSize: 12, color: T.indigo }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: T.indigo, letterSpacing: '0.01em', fontFamily: '"DM Mono", monospace' }}>{crumb.name}</Typography>
                  </Box>
                ) : (
                  <Link key={crumb.path} component="button" underline="none"
                    sx={{ display: 'flex', alignItems: 'center', gap: '5px', color: T.lTextMid, fontWeight: 500, fontSize: '0.8rem', borderRadius: '4px', px: '4px', transition: 'all 0.15s', fontFamily: '"DM Mono", monospace', '&:hover': { color: T.indigo, bgcolor: T.indigoMuted } }}
                    onClick={() => navigateToBreadcrumb(crumb)}
                  >
                    <Icon sx={{ fontSize: 12 }} />{crumb.name}
                  </Link>
                );
              })}
            </Breadcrumbs>
            {visibleItems.length > 0 && (
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: T.lTextMid, fontFamily: '"DM Mono", monospace', letterSpacing: '0.04em' }}>
                {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
              </Typography>
            )}
          </Box>

          <Divider sx={{ mx: '28px', mb: '12px', borderColor: T.lBorder, flexShrink: 0 }} />

          {/* Item list */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: '28px', pb: '24px' }}>
            {visibleItems.length === 0 ? (
              <ExplorerEmptyState />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {visibleItems.map((item) =>
                  item.kind === 'folder' ? (
                    <FolderCard
                      key={item.path} item={item}
                      isEditing={editingFolderId === item.path}
                      editingFolderName={editingFolderName}
                      onOpen={() => openFolder(item)}
                      onMenuOpen={(e) => openMenu(e, item)}
                      onNameChange={handleFolderNameChange}
                      onNameBlur={commitFolderRename}
                      onNameKeyDown={handleFolderNameKeyDown}
                    />
                  ) : (
                    <FileCard
                      key={item.rule_key} item={item}
                      onOpen={() => {
                        sessionStorage.setItem('activeRuleName', item.name);
                        sessionStorage.setItem('activeRuleId', item.rule_key);
                        navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules/editor?rule=${encodeURIComponent(item.rule_key)}`);
                      }}
                      onMenuOpen={(e) => openMenu(e, item)}
                      onMouseEnter={() => setHoveredRule(item)}
                      onMouseLeave={() => setHoveredRule(null)}
                    />
                  )
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Context menu */}
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{ '& .MuiPaper-root': { borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', border: `1px solid ${T.lBorder}`, minWidth: '140px', mt: '4px' }, '& .MuiList-root': { py: '6px' } }}
      >
        <MenuItem onClick={handleEdit} sx={{ fontSize: '0.8125rem', fontWeight: 500, color: T.lTextHigh, mx: '6px', borderRadius: '6px', py: '9px', px: '12px', '&:hover': { bgcolor: T.indigoMuted, color: T.indigo } }}>
          Rename
        </MenuItem>
        <Divider sx={{ my: '4px', borderColor: T.lBorder }} />
        <MenuItem onClick={handleDelete} sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#DC2626', mx: '6px', borderRadius: '6px', py: '9px', px: '12px', '&:hover': { bgcolor: '#FEF2F2' } }}>
          Delete
        </MenuItem>
      </Menu>

      {/* Confirm dialog */}
      <RcConfirmDialog
        open={confirmDialog.open} title={confirmDialog.title} message={confirmDialog.message}
        confirmText={confirmDialog.confirmText} cancelText="Cancel" isDangerous={true}
        onConfirm={confirmDialog.onConfirm} onCancel={closeConfirmDialog}
      />
    </>
  );
}