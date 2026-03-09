import { DecisionGraphType } from "@gorules/jdm-editor";
import { ExecuteResponse, JsonObject } from "@/modules/JdmEditorPage/types/jdmEditorEndpointsTypes";

// Types for JDM Editor components
export type JdmEditorProps = {
  value: DecisionGraphType;
  onChange: (val: DecisionGraphType) => void;
};

export interface JdmEditorComponentProps extends JdmEditorProps {
  onSimulatorRun?: (jdm: JdmEditorProps['value'], context: JsonObject) => Promise<ExecuteResponse>;
  isReviewer?: boolean;
}
// Types for Repository Tree
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

// Types for Repository Sidebar
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


// Editor Props
export type EditorProps = {
  items: RepoItem[];
  selectedId: string | number | null;
  openFiles: (string | number)[];               
  setOpenFiles: (files: (string | number)[]) => void; 
};


export interface EditorPropsExtended extends EditorProps {
  onSimulatorRun: (jdm: DecisionGraphType, context: JsonObject) => Promise<ExecuteResponse>;
  isReviewer?: boolean;
}

export interface RepoItem {
  id: string | number;
  name: string;
  type: 'file' | 'folder';
  graph?: DecisionGraphType;
  children?: RepoItem[];   
  path?: string;           
  parentPath?: string;    
}

// simulator Panel Props
export interface CustomSimulatorPanelProps {
  onRun: (context: JsonObject) => Promise<ExecuteResponse>;
  onClear: () => void;
}

//Chat UI types

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatUIProps {
  selectedRule?: string | number | null;
}