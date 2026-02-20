import { DecisionGraphType } from "@gorules/jdm-editor";

// Generic JSON-like types used across API payloads
export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}
// Types for JDM Editor components
export interface CustomSimulatorPanelProps {
  onRun: (context: JsonObject) => Promise<ExecuteResponse>;
  onClear: () => void;
}

export type EditorProps = {
  items: RepoItem[];
  selectedId: string | number | null;
  openFiles: (string | number)[];               
  setOpenFiles: (files: (string | number)[]) => void; 
};

export type JdmEditorProps = {
  value: DecisionGraphType;
  onChange: (val: DecisionGraphType) => void;
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


// API request/response types for execution
export interface ExecuteRequest {
  jdm: DecisionGraphType;
  input: JsonObject;
}

export interface ExecuteResponse {
  result?: JsonValue;
  error?: string;
  performance?: string;
  trace?: JsonObject;
  status?: 'success' | 'error';
  message?: string;
}