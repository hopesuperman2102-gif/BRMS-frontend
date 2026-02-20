// ─── Shared Types ─────────────────────────────────────────────────────────────

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