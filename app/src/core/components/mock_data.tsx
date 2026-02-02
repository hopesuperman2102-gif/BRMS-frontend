export type RuleFile = {
  id: string;
  name: string;
  version: string;
  status: 'Draft' | 'Active' | 'Archived';
  updatedAt: string;
};

export const projectRulesMock: RuleFile[] = [
  {
    id: '1',
    name: 'eligibility-rules.json',
    version: 'v1.0',
    status: 'Active',
    updatedAt: '15 minutes ago',
  },
  {
    id: '2',
    name: 'pricing-rules.json',
    version: 'v1.2',
    status: 'Draft',
    updatedAt: '10 minutes ago',
  },
  {
    id: '3',
    name: 'fraud-check.json',
    version: 'v2.0',
    status: 'Archived',
    updatedAt: '1 hour ago',
  },
];
