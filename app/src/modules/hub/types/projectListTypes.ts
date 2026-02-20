export type ProjectListProps = {
  id: string;
  project_key: string;
  name: string;
  description?: string;
  domain?: string;
  updatedAt: string;
};

// rules tables api endpoints types

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