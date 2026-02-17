// app/src/modules/feature-flags/types/featureFlagTypes.ts

export type Environment = 'DEV' | 'QA' | 'PROD';

export type RuleStatus = 'active' | 'pending' | 'veatus';

export type DeploymentStatus = 'active' | 'inactive';

// Main Rule interface - API format only (one entry per version)
export interface Rule {
  rule_key: string;
  rule_name: string;
  version: string;
}

// Grouped rule — one per unique rule_key, all versions collected
export interface GroupedRule {
  rule_key: string;
  rule_name: string;
  versions: string[];
}

// Deployed rule — from deployed_rules array in stats API response
export interface DeployedRule {
  rule_key: string;
  rule_name: string;
  version: string;
  environment: string;
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

export interface ActiveSync {
  count: number;
  lastSync?: string;
}

export interface DashboardStats {
  totalRules: number;
  deploymentHealth: DeploymentHealth;
  pendingSyncs: PendingSync[];
  activeSyncs: ActiveSync[];
  ruleChanges: RuleChange[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface EnvironmentConfig {
  name: Environment;
  color: string;
}