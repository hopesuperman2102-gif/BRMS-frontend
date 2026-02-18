'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Skeleton,
  IconButton, Menu, MenuItem, Breadcrumbs, Link, Divider,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SectionHeader from 'app/src/core/components/SectionHeader';

import { rulesApi, RuleResponse } from 'app/src/modules/rules/api/rulesApi';
import { projectsApi } from 'app/src/modules/hub/api/projectsApi';
import { verticalsApi } from '../../vertical/api/verticalsApi';
import { Breadcrumb, ExplorerItem, FileNode, FolderNode, ProjectResponse } from '../types/Explorertypes';
import { FileCard } from '../components/FileCard';
import { ExplorerEmptyState } from '../components/Exploreremptystate';
import { FolderCard } from '../components/FolderCard';
import RcConfirmDialog from 'app/src/core/components/RcConfirmDailog';


const STATUS_MAP: Record<string, { bg: string; color: string; dot: string }> = {
  using:      { bg: '#ECFDF5', color: '#065F46', dot: '#10B981' },
  active:     { bg: '#ECFDF5', color: '#065F46', dot: '#10B981' },
  draft:      { bg: '#FFFBEB', color: '#92400E', dot: '#F59E0B' },
  inactive:   { bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444' },
  deprecated: { bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444' },
};

export function StatusPill({ status }: { status: string }) {
  const style = STATUS_MAP[(status ?? '').toLowerCase()] ?? { bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: '99px', bgcolor: style.bg }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: style.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: style.color, textTransform: 'capitalize', letterSpacing: '0.02em' }}>
        {status}
      </Typography>
    </Box>
  );
}

// ─── Pure Helper Functions ────────────────────────────────────────────────────

export const splitPath = (path: string): string[] => path.split('/').filter(Boolean);

export const parentOfPath = (path: string): string =>
  splitPath(path).slice(0, -1).join('/');

export const fmtDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return iso ?? '—';
  }
};

// ─── Confirm Dialog State Type ────────────────────────────────────────────────

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectRulePage() {
  const { project_key, vertical_Key } = useParams<{ project_key: string; vertical_Key: string }>();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState<string>('');
  const [verticalName, setVerticalName] = useState<string>('');
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [files, setFiles] = useState<FileNode[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPath, setCurrentPath] = useState<string>('rule');
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ name: 'Rules', path: 'rule' }]);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [menuItem, setMenuItem] = useState<ExplorerItem | null>(null);
  const [newMenuAnchor, setNewMenuAnchor] = useState<HTMLElement | null>(null);

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // ── Confirm Dialog State ─────────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    onConfirm: () => {},
  });

  const closeConfirmDialog = () =>
    setConfirmDialog((prev) => ({ ...prev, open: false }));

  // ── Build tree ───────────────────────────────────────────────────────────

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
      kind: 'file', rule_key: r.rule_key, name: r.name,
      path: r.directory || `rule/${r.name}`,
      parentPath: parentOfPath(r.directory || `rule/${r.name}`),
      status: r.status, version: r.version ?? '—', updatedAt: r.updated_at,
    })));
  }, []);

  // ── One-time URL path init ───────────────────────────────────────────────

  const didInitFromUrl = useRef(false);
  useEffect(() => {
    if (didInitFromUrl.current) return;
    didInitFromUrl.current = true;
    const pathFromUrl = searchParams.get('path');
    if (!pathFromUrl) return;
    const parts = splitPath(pathFromUrl);
    const newBreadcrumbs: Breadcrumb[] = [{ name: 'Rules', path: 'rule' }];
    for (let i = 1; i < parts.length; i++) {
      newBreadcrumbs.push({ name: parts[i], path: parts.slice(0, i + 1).join('/') });
    }
    setCurrentPath(pathFromUrl);
    setBreadcrumbs(newBreadcrumbs);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch vertical & project names ──────────────────────────────────────

  useEffect(() => {
    if (!vertical_Key) return;
    verticalsApi.getVerticalsView()
      .then((v) => { const m = v.find((x) => x.vertical_key === vertical_Key); if (m) setVerticalName(m.vertical_name); })
      .catch((e: unknown) => console.error('Vertical fetch error', e));
  }, [vertical_Key]);

  useEffect(() => {
    if (!project_key) return;
    projectsApi.getProjectsView(vertical_Key!)
      .then((p: ProjectResponse[]) => { const m = p.find((x) => x.project_key === project_key); if (m?.name) setProjectName(m.name); })
      .catch((e: unknown) => console.error('Project fetch error', e));
  }, [project_key, vertical_Key]);

  // ── Load rules ───────────────────────────────────────────────────────────

  const loadRules = useCallback(async () => {
    if (!project_key) return;
    try {
      const rulesData = await rulesApi.getProjectRules(project_key);
      const enriched = await Promise.all(
        rulesData.map(async (r: RuleResponse) => {
          try {
            const versions = await rulesApi.getRuleVersions(r.rule_key);
            return { ...r, version: versions?.[0]?.version ?? 'Unversioned' };
          } catch { return { ...r, version: '—' }; }
        })
      );
      buildTree(enriched);
    } catch (err) { console.error('Error loading rules:', err); }
  }, [project_key, buildTree]);

  useEffect(() => { void loadRules(); }, [loadRules, refetchTrigger]);

  // ── Derived visible items ────────────────────────────────────────────────

  const visibleItems: ExplorerItem[] = [
    ...folders.filter((f) => f.parentPath === currentPath),
    ...files.filter((f) => f.parentPath === currentPath),
  ].sort((a, b) => {
    if (a.kind === 'folder' && b.kind !== 'folder') return -1;
    if (a.kind !== 'folder' && b.kind === 'folder') return 1;
    return a.name.localeCompare(b.name);
  });

  // ── Navigation ───────────────────────────────────────────────────────────

  const openFolder = (folder: FolderNode) => {
    if (editingFolderId === folder.path) return;
    setCurrentPath(folder.path);
    setBreadcrumbs((prev) => [...prev, { path: folder.path, name: folder.name }]);
  };

  const navigateToBreadcrumb = (entry: Breadcrumb) => {
    setCurrentPath(entry.path);
    setBreadcrumbs((prev) => prev.slice(0, prev.findIndex((b) => b.path === entry.path) + 1));
  };

  // ── Context menu ─────────────────────────────────────────────────────────

  const openMenu = (e: React.MouseEvent<HTMLElement>, item: ExplorerItem) => {
    e.stopPropagation(); setAnchorEl(e.currentTarget); setMenuItem(item);
  };
  const closeMenu = () => { setAnchorEl(null); setMenuItem(null); };

  // ── Delete ───────────────────────────────────────────────────────────────

  const executeDelete = async (item: ExplorerItem) => {
    try {
      if (item.kind === 'file') {
        await rulesApi.deleteRule(item.rule_key);
        setRefetchTrigger((n) => n + 1);
      } else {
        const inside = files.filter((f) => f.path.startsWith(item.path + '/'));
        if (inside.length === 0) {
          setFolders((prev) => prev.filter((f) => f.path !== item.path));
        } else {
          await Promise.all(inside.map((r) => rulesApi.deleteRule(r.rule_key)));
          setRefetchTrigger((n) => n + 1);
        }
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
    closeConfirmDialog();
  };

  const handleDelete = () => {
    if (!menuItem) return;
    closeMenu();

    if (menuItem.kind === 'file') {
      setConfirmDialog({
        open: true,
        title: 'Delete Rule',
        message: `"${menuItem.name}" will be permanently deleted and cannot be recovered.`,
        confirmText: 'Delete Rule',
        onConfirm: () => executeDelete(menuItem),
      });
    } else {
      const inside = files.filter((f) => f.path.startsWith(menuItem.path + '/'));
      setConfirmDialog({
        open: true,
        title: 'Delete Folder',
        message: inside.length > 0
          ? `"${menuItem.name}" contains ${inside.length} rule${inside.length > 1 ? 's' : ''}. Deleting this folder will permanently remove all rules inside it.`
          : `"${menuItem.name}" will be permanently deleted and cannot be recovered.`,
        confirmText: 'Delete Folder',
        onConfirm: () => executeDelete(menuItem),
      });
    }
  };

  // ── Edit / Rename ─────────────────────────────────────────────────────────

  const handleEdit = () => {
    if (!menuItem) return;
    if (menuItem.kind === 'file') {
      navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules/createrules?key=${menuItem.rule_key}`);
    } else {
      setEditingFolderId(menuItem.path);
      setEditingFolderName(menuItem.name);
    }
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
    if (folders.some((f) => f.path === newFolderPath && f.path !== editingFolderId)) {
      setFolders((prev) => prev.filter((f) => f.path !== editingFolderId));
      clearEditing(); return;
    }
    try {
      const oldPath = folder.path;
      const rulesToUpdate = files.filter((f) => f.path.startsWith(oldPath + '/'));
      if (rulesToUpdate.length === 0) {
        setFolders((prev) => prev.map((f) => f.path === editingFolderId ? { ...f, path: newFolderPath, name: trimmedName, isTemp: false } : f));
        clearEditing(); return;
      }
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

  const handleFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setEditingFolderName(e.target.value);
  const handleFolderNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void commitFolderRename();
    if (e.key === 'Escape') { setFolders((prev) => prev.filter((f) => f.path !== editingFolderId)); clearEditing(); }
  };

  // ── Create ───────────────────────────────────────────────────────────────

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

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <Card elevation={0} sx={{ borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }}>
      <CardContent sx={{ p: 2.5 }}>

        {/* Header */}
        <SectionHeader
          left={
            <Box display="flex" alignItems="center" gap={1.5}>
              <IconButton
                onClick={() => navigate(`/vertical/${vertical_Key}/dashboard/hub`)}
                sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: 'rgba(101, 82, 208, 0.08)', color: '#6552D0', transition: 'all 0.2s', flexShrink: 0, '&:hover': { backgroundColor: 'rgba(101, 82, 208, 0.15)', transform: 'translateX(-2px)' } }}
              >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                  {verticalName || <Skeleton width={80} />}
                </Typography>
                <Typography sx={{ color: '#D1D5DB', fontSize: '0.875rem' }}>›</Typography>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#6552D0' }}>
                  {projectName || <Skeleton width={120} />}
                </Typography>
              </Box>
            </Box>
          }
          right={
            <Box>
              <Button
                variant="contained" startIcon={<AddIcon />} endIcon={<KeyboardArrowDownIcon />}
                onClick={(e) => setNewMenuAnchor(e.currentTarget)} disableElevation
                sx={{ background: 'linear-gradient(135deg, #6552D0 0%, #17203D 100%)', borderRadius: '8px', px: 2, py: 0.75, textTransform: 'none', fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(101, 82, 208, 0.25)', '&:hover': { background: 'linear-gradient(135deg, #5441BF 0%, #0f1629 100%)', boxShadow: '0 6px 16px rgba(101, 82, 208, 0.35)', transform: 'translateY(-1px)' }, transition: 'all 0.2s' }}
              >
                New
              </Button>
              <Menu anchorEl={newMenuAnchor} open={!!newMenuAnchor} onClose={() => setNewMenuAnchor(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={{ '& .MuiPaper-root': { borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid #F3F4F6', minWidth: '168px', mt: 0.75 }, '& .MuiList-root': { py: 0.75 } }}
              >
                <MenuItem onClick={handleCreateNewRule} sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#111827', mx: 0.75, borderRadius: '7px', py: 1, px: 1.25, gap: 1.25, '&:hover': { bgcolor: '#F5F3FF' } }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: '7px', background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <InsertDriveFileOutlinedIcon sx={{ fontSize: 15, color: '#6366f1' }} />
                  </Box>
                  New Rule
                </MenuItem>
                <MenuItem onClick={handleCreateNewFolder} sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#111827', mx: 0.75, borderRadius: '7px', py: 1, px: 1.25, gap: 1.25, '&:hover': { bgcolor: '#FFFBEB' } }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: '7px', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderIcon sx={{ fontSize: 15, color: '#D97706' }} />
                  </Box>
                  New Folder
                </MenuItem>
              </Menu>
            </Box>
          }
        />

        {/* Breadcrumbs */}
        <Box sx={{ mt: 2, mb: 1, px: 1.5, py: 0.875, bgcolor: '#F8F7FF', borderRadius: '10px', border: '1px solid #EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Breadcrumbs separator={<Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#C4B5FD' }} />}>
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              const Icon = idx === 0 ? HomeIcon : FolderIcon;
              const iconColor = idx === 0 ? (isLast ? '#6552D0' : '#A78BFA') : '#D97706';
              return isLast ? (
                <Box key={crumb.path} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Icon sx={{ fontSize: 13, color: iconColor }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#6552D0', letterSpacing: '0.01em' }}>{crumb.name}</Typography>
                </Box>
              ) : (
                <Link key={crumb.path} component="button" underline="none"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#7C3AED', fontWeight: 500, fontSize: '0.8rem', opacity: 0.6, borderRadius: '5px', px: 0.5, transition: 'all 0.15s', '&:hover': { opacity: 1, bgcolor: '#EDE9FE' } }}
                  onClick={() => navigateToBreadcrumb(crumb)}
                >
                  <Icon sx={{ fontSize: 13, color: iconColor }} />{crumb.name}
                </Link>
              );
            })}
          </Breadcrumbs>
          {visibleItems.length > 0 && (
            <Box sx={{ px: 1, py: 0.25, borderRadius: '20px', bgcolor: '#EDE9FE' }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6552D0' }}>
                {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 1.5, borderColor: '#F3F4F6' }} />

        {/* Item List */}
        <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
          {visibleItems.length === 0 ? (
            <ExplorerEmptyState />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {visibleItems.map((item) =>
                item.kind === 'folder' ? (
                  <FolderCard
                    key={item.path}
                    item={item}
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
                    key={item.rule_key}
                    item={item}
                    onOpen={() => {
                      sessionStorage.setItem('activeRuleName', item.name);
                      sessionStorage.setItem('activeRuleId', item.rule_key);
                      navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules/editor?rule=${encodeURIComponent(item.rule_key)}`);
                    }}
                    onMenuOpen={(e) => openMenu(e, item)}
                  />
                )
              )}
            </Box>
          )}
        </Box>

        {/* Context Menu */}
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          sx={{ '& .MuiPaper-root': { borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid #F3F4F6', minWidth: '148px', mt: 0.5 }, '& .MuiList-root': { py: 0.75 } }}
        >
          <MenuItem onClick={handleEdit} sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#111827', mx: 0.75, borderRadius: '7px', py: 0.875, px: 1.25, '&:hover': { bgcolor: '#F5F3FF', color: '#6552D0' } }}>
            Rename
          </MenuItem>
          <Divider sx={{ my: 0.5, borderColor: '#F3F4F6' }} />
          <MenuItem onClick={handleDelete} sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#DC2626', mx: 0.75, borderRadius: '7px', py: 0.875, px: 1.25, '&:hover': { bgcolor: '#FEF2F2' } }}>
            Delete
          </MenuItem>
        </Menu>

        {/* ── Confirm Delete Dialog ── */}
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

      </CardContent>
    </Card>
  );
}