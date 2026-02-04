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

export const projectsMock = [
  {
    id: '1', 
    name: 'Project Alpha',
    project_key: 'alpha',  
    updatedAt: '2/1/2026, 10:30 AM',
  },
  {
    id: '2', 
    name: 'Project Beta',
    project_key: 'beta',  
    updatedAt: '2/2/2026, 2:15 PM',
  },
  {
    id: '3', 
    name: 'Project Gammma',
    project_key: 'gamma',  
    updatedAt: '2/2/2026, 2:15 PM',
  },
];