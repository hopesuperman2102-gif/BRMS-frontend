
export interface ProjectResponse {
  project_key: string;
  name: string;
}

export interface Breadcrumb {
  name: string;
  path: string;
}

export interface FolderNode {
  kind: 'folder';
  path: string;
  name: string;
  parentPath: string;
  isTemp?: boolean;
}

export interface FileNode {
  kind: 'file';
  rule_key: string;
  name: string;
  path: string;
  parentPath: string;
  status: string;
  version?: string;
  updatedAt: string;
  description?: string;
}

export type ExplorerItem = FolderNode | FileNode;

// ─── FileCard props ───

export interface FileCardProps {
  item: FileNode;
  onOpen: () => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// ─── FolderCard props ───

export interface FolderCardProps {
  item: FolderNode;
  isEditing: boolean;
  editingFolderName: string;
  onOpen: () => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameBlur: () => void;
  onNameKeyDown: (e: React.KeyboardEvent) => void;
}

// ─── Rule Left Panel Props ────
export interface RulesLeftPanelProps {
  projectName: string;
  folders: FolderNode[];
  files: FileNode[];
  hoveredRule: FileNode | null;
}

/* ─── Rule Right Panel Props ─────────────────────────────────────────────── */

export interface RulesRightPanelProps {
  projectName: string;
  verticalName: string;
  breadcrumbs: Breadcrumb[];
  visibleItems: ExplorerItem[];
  editingFolderId: string | null;
  editingFolderName: string;
  newMenuAnchor: HTMLElement | null;
  onBack: () => void;
  onNewMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onNewMenuClose: () => void;
  onCreateNewRule: () => void;
  onCreateNewFolder: () => void;
  onNavigateToBreadcrumb: (crumb: Breadcrumb) => void;
  onOpenFolder: (item: FolderNode) => void;
  onOpenFile: (item: FileNode) => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, item: ExplorerItem) => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameBlur: () => void;
  onNameKeyDown: (e: React.KeyboardEvent) => void;
  onMouseEnterFile: (item: FileNode) => void;
  onMouseLeaveFile: () => void;
}