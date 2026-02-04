export type RuleFile = {
  id: string;
  name: string;
  version: string;
  status: 'Draft' | 'Active' | 'Archived';
  updatedAt: string;
};