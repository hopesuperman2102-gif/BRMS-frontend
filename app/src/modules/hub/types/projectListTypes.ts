export type ProjectListProps = {
  id: string;
  project_key: string;
  name: string;
  description?: string;
  domain?: string;
  updatedAt: string;
};

export interface ProjectView {
  id: string;
  project_key: string;
  name: string;
  description?: string;
  domain?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VerticalProjectsResponse {
  vertical_key: string;
  vertical_name: string;
  status: string;
  projects: ProjectView[];
}

export interface ProjectListLeftPanelProps {
  projects: ProjectListProps[];
  hoveredProject: ProjectListProps | null;
}

export interface ProjectListRightPanelProps {
  loading: boolean;
  paginatedProjects: ProjectListProps[];
  totalPages: number;
  page: number;
  menuAnchorEl: null | HTMLElement;
  onPageChange: (page: number) => void;
  onOpenProject: (project: ProjectListProps) => void;
  onMenuOpen: (e: React.MouseEvent, project: ProjectListProps) => void;
  onMenuClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNewProject: () => void;
  onHoverProject: (project: ProjectListProps | null) => void;
  /** When true, hides the context menu (Edit/Delete) and New Project button */
  isRuleAuthor?: boolean;
}