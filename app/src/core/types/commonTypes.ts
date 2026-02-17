import { AlertColor } from "@mui/material";
import type { DecisionGraphType } from "@gorules/jdm-editor";

// Generic JSON-like types used across API payloads
export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

export type MoveConfirmDialogProps = {
  open: boolean;
  itemName: string;
  targetName: string;
  onClose: () => void;
  onConfirm: () => void;
};

export type JdmEditorProps = {
  value: DecisionGraphType;
  onChange: (val: DecisionGraphType) => void;
};

export type CreateItemDialogProps = {
  open: boolean;
  title: string;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export type Project = {
  id: number;
  name: string;
};

export type ProjectTabsProps = {
  projects: Project[];
  activeProjectId: number | null;
  onSelect: (id: number) => void;
  onClose: (id: number) => void;
};

export interface RepoItem {
  id: string | number;
  name: string;
  type: 'file' | 'folder';
  graph?: DecisionGraphType;
  children?: RepoItem[];   
  path?: string;           
  parentPath?: string;    
}

export type RepoTreeProps = {
  items: RepoItem[];
  selectedId: string | number | null;
  expandedFolders: Set<string | number>;
  onToggleFolder: (id: string | number) => void;
  onSelectItem: (item: RepoItem) => void;
  onDragStart: (item: RepoItem) => void;
  onDropOnFolder: (folder: RepoItem) => void;
  depth?: number;
};

export type RepositorySidebarProps = {
  projectName: string;
  items: RepoItem[];
  selectedId: string | number | null;            
  expandedFolders: Set<string | number>;         
  onToggleFolder: (id: string | number) => void; 
  onSelectItem: (item: RepoItem) => void;
  onAddClick: (el: HTMLElement) => void;
  onDragStart: (item: RepoItem) => void;
  onDropOnFolder: (folder: RepoItem) => void;
  onBackClick?: () => void;
};

export interface AlertState {
  open: boolean;
  message: string;
  type: AlertColor;
  showAlert: (message: string, type: AlertColor) => void;
  hideAlert: () => void;
}
