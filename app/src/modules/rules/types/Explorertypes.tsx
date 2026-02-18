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
}

export type ExplorerItem = FolderNode | FileNode;