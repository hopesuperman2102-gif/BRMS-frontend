import { DropdownItem } from "app/src/core/components/Dropdown";
import { BreadcrumbItem, DashboardStats, DeploymentHistory, Environment, Rule } from "./types/featureFlagTypes";

// Mock Data - Replace with actual API calls
export const mockStats: DashboardStats = {
  totalRules: 1245,
  deploymentHealth: {
  total: 30,
  pending: 10,
  approved: 15,
  rejected: 5,
},
  pendingSyncs: [
    { count: 12 },
  ],

    activeSyncs: [
    { count: 13 },
    { count: 13, lastSync: '2023-10-26 14:50 UTC' }
  ],
  ruleChanges: [
    { version: '230be', count: 5 },
    { version: 'En', count: 18 },
    { version: '230be', count: 22 },
    { version: '100be', count: 35 }
  ]
};

export const mockRules: Rule[] = [
  { id: '1', name: 'Feature Flag Beta', status: 'veatus' },
  { id: '2', name: 'Recommendation Engine v2', status: 'pending' },
  { 
    id: '3', 
    name: 'Payment Gateway Fix', 
    status: 'active', 
    version: 'v1.1 (Active)', 
    latestVersion: 'v1.2 (Latest)' 
  }
];

export const mockActiveRules: DeploymentHistory[] = [
  {
    id: '1',
    ruleName: 'Feature Flag Beta',
    deployedVersion: '',
    deployedBy: '',
    deploymentDate: '',
    status: 'active'
  },
  {
    id: '2',
    ruleName: 'Recommendation Engine v1.2',
    deployedVersion: '',
    deployedBy: '',
    deploymentDate: '',
    status: 'active'
  },
  {
    id: '3',
    ruleName: 'Login Revamp v3.1',
    deployedVersion: '',
    deployedBy: '',
    deploymentDate: '',
    status: 'active'
  }
];

// mock/projects.ts
export interface Project {
  id: string;
  name: string;
}

export const projectItems: DropdownItem[] = [
  {
    label: 'Apollo',
    value: 'apollo',
  },
  {
    label: 'Zeus',
    value: 'zeus',
  },

];

export const environments: Environment[] = ['DEV', 'QA', 'PROD'];
