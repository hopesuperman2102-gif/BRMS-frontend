'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  Breadcrumbs,
  Link,
  Divider,
  Chip,
  TextField,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import RcTable from 'app/src/core/components/RcTable';
import SectionHeader from 'app/src/core/components/SectionHeader';
import { rulesApi, RuleResponse } from 'app/src/modules/rules/api/rulesApi';
import { projectsApi } from 'app/src/modules/hub/api/projectsApi';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProjectResponse {
  project_key: string;
  name: string;
}

interface Breadcrumb {
  name: string;
  path: string;
}

interface FolderNode {
  kind: 'folder';
  path: string;
  name: string;
  parentPath: string;
  isTemp?: boolean;
}

interface FileNode {
  kind: 'file';
  rule_key: string;
  name: string;
  path: string;
  parentPath: string;
  status: string;
  version?: string;
  updatedAt: string;
}

type ExplorerItem = FolderNode | FileNode;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const splitPath = (path: string): string[] => path.split('/').filter(Boolean);

const parentOfPath = (path: string): string =>
  splitPath(path).slice(0, -1).join('/');

const fmtDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso ?? '—';
  }
};

// ─── FolderNameEditor ─────────────────────────────────────────────────────────
// Auto-focuses and selects text on mount, matching Windows Explorer behaviour.

function FolderNameEditor({
  folderName,
  onChange,
  onBlur,
  onKeyDown,
}: {
  folderName: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Defer DOM mutation to after the paint cycle (lint-safe, no setState)
    const id = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
    return () => clearTimeout(id);
  }, []); // runs once on mount

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5 }}>
      <FolderIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
      <TextField
        inputRef={inputRef}
        size="small"
        value={folderName}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem', fontWeight: 500 } }}
      />
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectRuleComponent() {
  const { project_key, vertical_Key } = useParams<{
    project_key: string;
    vertical_Key: string;
  }>();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState<string>('');
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [files, setFiles] = useState<FileNode[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPath, setCurrentPath] = useState<string>('rule');
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([
    { name: 'Rules', path: 'rule' },
  ]);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [menuItem, setMenuItem] = useState<ExplorerItem | null>(null);
  const [newMenuAnchor, setNewMenuAnchor] = useState<HTMLElement | null>(null);

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [refetchTrigger, setRefetchTrigger] = useState(0);

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
            kind: 'folder',
            path: folderPath,
            name: parts[i - 1],
            parentPath: i > 1 ? parts.slice(0, i - 1).join('/') : '',
          });
        }
      }
    });

    // Preserve any unsaved temporary folders in state
    setFolders((prev) => {
      const tempFolders = prev.filter((f) => f.isTemp);
      return [...Array.from(folderMap.values()), ...tempFolders];
    });

    setFiles(
      rules.map((r) => ({
        kind: 'file',
        rule_key: r.rule_key,
        name: r.name,
        path: r.directory || `rule/${r.name}`,
        parentPath: parentOfPath(r.directory || `rule/${r.name}`),
        status: r.status,
        version: r.version ?? '—',
        updatedAt: r.updated_at,
      }))
    );
  }, []);

  // ── One-time URL path initialisation ────────────────────────────────────
  // didInitFromUrl ref prevents repeated setState calls on re-renders.

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

    // React 18 batches all three — no cascading renders
    setCurrentPath(pathFromUrl);
    setBreadcrumbs(newBreadcrumbs);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — one-time mount initialisation

  // ── Fetch project name ───────────────────────────────────────────────────

  useEffect(() => {
    if (!project_key) return;
    projectsApi
      .getProjectsView(vertical_Key!)
      .then((projects: ProjectResponse[]) => {
        const match = projects.find((p) => p.project_key === project_key);
        if (match?.name) setProjectName(match.name);
      })
      .catch((err: unknown) => console.error('Project fetch error', err));
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
            return { ...r, version: versions?.[0]?.version ?? '—' };
          } catch {
            return { ...r, version: '—' };
          }
        })
      );
      buildTree(enriched);
    } catch (err) {
      console.error('Error loading rules:', err);
    }
  }, [project_key, buildTree]);

  useEffect(() => {
    // void keeps the effect body synchronous (satisfies react-hooks/set-state-in-effect)
    void loadRules();
  }, [loadRules, refetchTrigger]);

  // ── Visible items (derived, no state needed) ─────────────────────────────

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
    const idx = breadcrumbs.findIndex((b) => b.path === entry.path);
    setBreadcrumbs(breadcrumbs.slice(0, idx + 1));
  };

  // ── Context menu ─────────────────────────────────────────────────────────

  const openMenu = (e: React.MouseEvent<HTMLElement>, item: ExplorerItem) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setMenuItem(item);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!menuItem) return;

    const msg =
      menuItem.kind === 'folder'
        ? `Delete folder "${menuItem.name}"? All rules inside will also be deleted.`
        : `Delete "${menuItem.name}"?`;

    if (!window.confirm(msg)) { closeMenu(); return; }

    try {
      if (menuItem.kind === 'file') {
        await rulesApi.deleteRule(menuItem.rule_key);
        setRefetchTrigger((n) => n + 1);
      } else {
        const inside = files.filter((f) => f.path.startsWith(menuItem.path + '/'));
        if (inside.length === 0) {
          // Empty folder — local-state removal only
          setFolders((prev) => prev.filter((f) => f.path !== menuItem.path));
        } else {
          await Promise.all(inside.map((r) => rulesApi.deleteRule(r.rule_key)));
          setRefetchTrigger((n) => n + 1);
        }
      }
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete. Please try again.');
    }

    closeMenu();
  };

  // ── Edit ─────────────────────────────────────────────────────────────────

  const handleEdit = () => {
    if (!menuItem) return;
    if (menuItem.kind === 'file') {
      navigate(
        `/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules/createrules?key=${menuItem.rule_key}`
      );
    } else {
      setEditingFolderId(menuItem.path);
      setEditingFolderName(menuItem.name);
    }
    closeMenu();
  };

  // ── Folder rename ─────────────────────────────────────────────────────────

  const clearEditing = () => {
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const commitFolderRename = async () => {
    if (!editingFolderId) return;

    const trimmedName = editingFolderName.trim();

    if (!trimmedName) {
      setFolders((prev) => prev.filter((f) => f.path !== editingFolderId));
      clearEditing();
      return;
    }

    const folder = folders.find((f) => f.path === editingFolderId);
    if (!folder) return;

    const newFolderPath = folder.parentPath
      ? `${folder.parentPath}/${trimmedName}`
      : trimmedName;

    if (folders.some((f) => f.path === newFolderPath && f.path !== editingFolderId)) {
      alert('A folder with that name already exists');
      setFolders((prev) => prev.filter((f) => f.path !== editingFolderId));
      clearEditing();
      return;
    }

    try {
      const oldPath = folder.path;
      const rulesToUpdate = files.filter((f) => f.path.startsWith(oldPath + '/'));

      if (rulesToUpdate.length === 0) {
        // Empty / new folder — state only, no API
        setFolders((prev) =>
          prev.map((f) =>
            f.path === editingFolderId
              ? { ...f, path: newFolderPath, name: trimmedName, isTemp: false }
              : f
          )
        );
        clearEditing();
        return;
      }

      // Patch every contained rule's directory
      await Promise.all(
        rulesToUpdate.map((rule) =>
          rulesApi.updateRuleDirectory({
            rule_key: rule.rule_key,
            updated_by: 'admin',
            directory: rule.path.replace(oldPath, newFolderPath),
          })
        )
      );

      setFolders((prev) =>
        prev.map((f) => {
          if (f.path === editingFolderId)
            return { ...f, path: newFolderPath, name: trimmedName, isTemp: false };
          if (f.path.startsWith(oldPath + '/'))
            return { ...f, path: f.path.replace(oldPath, newFolderPath) };
          return f;
        })
      );

      setRefetchTrigger((n) => n + 1);
    } catch (err) {
      console.error('Failed to rename folder:', err);
      alert('Failed to rename folder. Please try again.');
    }

    clearEditing();
  };

  const handleFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditingFolderName(e.target.value);

  const handleFolderNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void commitFolderRename();
    if (e.key === 'Escape') {
      setFolders((prev) => prev.filter((f) => f.path !== editingFolderId));
      clearEditing();
    }
  };

  // ── Create ───────────────────────────────────────────────────────────────

  const handleCreateNewFolder = () => {
    setNewMenuAnchor(null);
    const name = 'New folder';
    const path = `${currentPath}/${name}`;
    setFolders((prev) => [
      ...prev,
      { kind: 'folder', path, name, parentPath: currentPath, isTemp: true },
    ]);
    setEditingFolderId(path);
    setEditingFolderName(name);
  };

  const handleCreateNewRule = () => {
    setNewMenuAnchor(null);
    navigate(
      `/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules/createrules?directory=${encodeURIComponent(currentPath)}`
    );
  };

  // ── Render helpers ───────────────────────────────────────────────────────

  const statusChip = (status: string) => (
    <Chip
      label={status}
      size="small"
      color={status === 'using' ? 'success' : status === 'DRAFT' ? 'warning' : 'default'}
      sx={{ textTransform: 'capitalize', fontSize: 11 }}
    />
  );

  const rows = visibleItems.map((item) => {
    if (item.kind === 'folder') {
      const isEditing = editingFolderId === item.path;
      return {
        Name: isEditing ? (
          <FolderNameEditor
            folderName={editingFolderName}
            onChange={handleFolderNameChange}
            onBlur={commitFolderRename}
            onKeyDown={handleFolderNameKeyDown}
          />
        ) : (
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              cursor: 'pointer', px: 1, py: 0.5, borderRadius: 1,
              '&:hover': { bgcolor: 'grey.50' },
            }}
            onClick={() => openFolder(item)}
          >
            <FolderIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
            <Typography sx={{ fontWeight: 500 }}>{item.name}</Typography>
          </Box>
        ),
        Version: <Typography color="text.disabled">—</Typography>,
        Status: <Typography color="text.disabled">—</Typography>,
        'Last updated': <Typography variant="body2" color="text.secondary">—</Typography>,
        '': !isEditing ? (
          <IconButton size="small" onClick={(e) => openMenu(e, item)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} />
        ),
      };
    }

    return {
      Name: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InsertDriveFileOutlinedIcon sx={{ color: '#6366f1', fontSize: 18 }} />
          <Typography
            sx={{
              color: '#4f46e5', cursor: 'pointer', fontWeight: 500,
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() => {
              sessionStorage.setItem('activeRuleName', item.name);
              sessionStorage.setItem('activeRuleId', item.rule_key);
              navigate(
                `/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules/editor?rule=${encodeURIComponent(item.rule_key)}`
              );
            }}
          >
            {item.name}
          </Typography>
        </Box>
      ),
      Version: <Typography variant="body2" color="text.secondary">{item.version}</Typography>,
      Status: statusChip(item.status),
      'Last updated': (
        <Typography variant="body2" color="text.secondary">{fmtDate(item.updatedAt)}</Typography>
      ),
      '': (
        <IconButton size="small" onClick={(e) => openMenu(e, item)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    };
  });

  // ── JSX ──────────────────────────────────────────────────────────────────

  return (
    <Card>
      <CardContent>
        <SectionHeader
          left={
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton
                onClick={() => navigate(`/vertical/${vertical_Key}/dashboard/hub`)}
                sx={{
                  width: 36, height: 36, borderRadius: '10px',
                  backgroundColor: 'rgba(101, 82, 208, 0.08)', color: '#6552D0',
                  transition: 'all 0.2s', flexShrink: 0,
                  '&:hover': { backgroundColor: 'rgba(101, 82, 208, 0.15)', transform: 'translateX(-2px)' },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                {projectName || <Skeleton width={120} />}
              </Typography>
            </Box>
          }
          right={
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                onClick={(e) => setNewMenuAnchor(e.currentTarget)}
                disableElevation
              >
                New
              </Button>
              <Menu
                anchorEl={newMenuAnchor}
                open={!!newMenuAnchor}
                onClose={() => setNewMenuAnchor(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleCreateNewRule}>
                  <InsertDriveFileOutlinedIcon sx={{ mr: 1.5, fontSize: 18, color: '#6366f1' }} />
                  New Rule
                </MenuItem>
                <MenuItem onClick={handleCreateNewFolder}>
                  <FolderIcon sx={{ mr: 1.5, fontSize: 18, color: '#f59e0b' }} />
                  New Folder
                </MenuItem>
              </Menu>
            </Box>
          }
        />

        <Box sx={{ my: 1.5 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              const icon =
                idx === 0 ? (
                  <HomeIcon sx={{ fontSize: 15, mr: 0.5 }} />
                ) : (
                  <FolderIcon sx={{ fontSize: 15, mr: 0.5, color: '#f59e0b' }} />
                );
              return isLast ? (
                <Box key={crumb.path} sx={{ display: 'flex', alignItems: 'center', color: 'text.primary' }}>
                  {icon}
                  <Typography fontWeight={600} fontSize={13}>{crumb.name}</Typography>
                </Box>
              ) : (
                <Link
                  key={crumb.path}
                  component="button"
                  underline="hover"
                  color="inherit"
                  fontSize={13}
                  sx={{ display: 'flex', alignItems: 'center' }}
                  onClick={() => navigateToBreadcrumb(crumb)}
                >
                  {icon}
                  {crumb.name}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
          {rows.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <FolderOpenIcon sx={{ fontSize: 52, mb: 1.5, opacity: 0.25 }} />
              <Typography variant="body2" fontWeight={500}>This folder is empty</Typography>
              <Typography variant="caption">
                Use <strong>New</strong> to create a rule or folder.
              </Typography>
            </Box>
          ) : (
            <RcTable
              headers={['Name', 'Version', 'Status', 'Last updated', '']}
              rows={rows}
              selectedRowIndex={null}
              onRowClick={() => {}}
            />
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={closeMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleEdit}>Rename</MenuItem>
          <Divider />
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Delete</MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
}