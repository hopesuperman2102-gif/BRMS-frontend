// app/src/modules/feature-flags/types/featureFlagTypes.ts

export type Environment = 'DEV' | 'QA' | 'PROD';

export type RuleStatus = 'active' | 'pending' | 'veatus';

export type DeploymentStatus = 'active' | 'inactive';

export interface Rule {
  id: string;
  name: string;
  status: RuleStatus;
  version?: string;
  latestVersion?: string;
}

export interface DeploymentHistory {
  id: string;
  ruleName: string;
  deployedVersion: string;
  deployedBy: string;
  deploymentDate: string;
  status: DeploymentStatus;
}

export interface RuleChange {
  version: string;
  count: number;
}

export interface DeploymentHealth {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface PendingSync {
  count: number;
}

export interface activeSync {
  count: number;
  lastSync?: string;
}

export interface DashboardStats {
  totalRules: number;
  deploymentHealth: DeploymentHealth;
  pendingSyncs: PendingSync[];
  activeSyncs: activeSync[];
  ruleChanges: RuleChange[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}