export type RepoItem = {
  id: number;
  name: string;
  type: 'file' | 'folder';
  children?: RepoItem[];
  graph?: any;
};
