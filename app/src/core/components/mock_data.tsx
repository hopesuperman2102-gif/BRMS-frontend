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

  {
    id: '1',
    name: 'eligibility-rules.json',
    version: 'v1.0',
    status: 'Active',
    updatedAt: '15 minutes ago',
  },

  {
    id: '1',
    name: 'eligibility-rules.json',
    version: 'v1.0',
    status: 'Active',
    updatedAt: '15 minutes ago',
  },

  {
    id: '1',
    name: 'eligibility-rules.json',
    version: 'v1.0',
    status: 'Active',
    updatedAt: '15 minutes ago',
  },

  {
    id: '1',
    name: 'eligibility-rules.json',
    version: 'v1.0',
    status: 'Active',
    updatedAt: '15 minutes ago',
  },



  {
    id: '1',
    name: 'eligibility-rules.json',
    version: 'v1.0',
    status: 'Active',
    updatedAt: '15 minutes ago',
  },



  {
    id: '1',
    name: 'eligibility-rules.json',
    version: 'v1.0',
    status: 'Active',
    updatedAt: '15 minutes ago',
  },

  {
    id: '1',
    name: 'eligibility-rules.json',
    version: 'v1.0',
    status: 'Active',
    updatedAt: '15 minutes ago',
  },

  {
    id: '1',
    name: 'eligibility-rules.json',
    version: 'v1.0',
    status: 'Active',
    updatedAt: '15 minutes ago',
  },

  {
    id: '1',
    name: 'eligibility-rules.json',
    version: 'v1.0',
    status: 'Active',
    updatedAt: '15 minutes ago',
  },
  
];


export type Project = {
  id: number;
  name: string;
  updatedAt: string;
};

export const projectsMock: Project[] = [
  {
    id: 1,
    name: 'Project Alpha',
    updatedAt: new Date('2024-01-15').toLocaleString(),
  },
  {
    id: 2,
    name: 'Project Beta',
    updatedAt: new Date('2024-02-20').toLocaleString(),
  },
  {
    id: 3,
    name: 'Project Gamma',
    updatedAt: new Date('2024-03-10').toLocaleString(),
  },
];