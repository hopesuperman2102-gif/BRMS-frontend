export type RuleFile = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  version?: string;
  status?: string;
  updatedAt?: string;
  parent_id: string | null;
  directory: string;
  children?: RuleFile[];
};