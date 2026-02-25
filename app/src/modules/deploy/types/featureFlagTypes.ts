// app/src/modules/feature-flags/types/featureFlagTypes.ts

import { MonthlyData, RcDropdownItem } from "app/src/core/types/commonTypes";
import type { SxProps, Theme } from '@mui/material/styles';

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

export interface EnvHealth {
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
  deploymentHealth: EnvHealth;
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

// ActiveRules Props
export interface ActiveRulesProps {
  rules: DeployedRule[];
  onRollback: (ruleKey: string) => void;
  onViewLogs: (ruleKey: string) => void;
  environment: string;
  delay?: number;
}

// ControlSection Props
export interface ControlSectionProps {
  rules: Rule[];
  selectedRules: Set<string>;
  selectedVersions: Map<string, string>;
  onToggleRule: (ruleId: string) => void;
  onVersionChange: (ruleKey: string, version: string) => void;
  environments: Environment[];
  selectedEnvironment: Environment;
  onEnvironmentChange: (env: Environment) => void;
  onDeploy: () => void;
  lastDeployedBy?: string;
  lastDeployedTime?: string;
  isLoading?: boolean;
}

// DeployHeader Props
export interface DeployHeaderProps {
  totalRules: number;
  projectItems: RcDropdownItem[];
  selectedProject: string;
  onProjectSelect: (value: string) => void;
  environments: Environment[];
  activeEnvironment?: Environment | 'ALL';
  onEnvironmentClick?: (env: Environment | 'ALL') => void;
}

// DeploymentHealth Props
export interface DeploymentHealthProps {
  title: string;
  health: EnvHealth;
  delay?: number;
}

// EnvironmentDeployment Props 
export interface EnvironmentDeploymentProps {
  environments: Environment[];
  selectedEnvironment: Environment;
  onEnvironmentChange: (env: Environment) => void;
  onDeploy: () => void;
  lastDeployedBy?: string;
  lastDeployedTime?: string;
  delay?: number;
  sx?: SxProps<Theme>;
}

// EnvironmentHistory Props
export interface EnvironmentHistoryProps {
  rules: DeployedRule[];
  onRollback: (ruleKey: string) => void;
  onViewLogs: (ruleKey: string) => void;
  environment: string;
}

// PendingSync Props
export interface PendingSyncProps {
  title: string;
  value: number | string;
  timestamp?: string;
  delay?: number;
}

// RuleVersionControl Props
export interface RuleVersionControlProps {
  rules: Rule[];
  selectedRules: Set<string>;
  selectedVersions: Map<string, string>;
  onToggleRule: (ruleKey: string) => void;
  onVersionChange: (ruleKey: string, version: string) => void;
  delay?: number;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
}

// StatsSection Props
export interface StatsSectionProps {
  stats: {
    totalRuleVersions: number;
    pendingVersions: number;
    approvedVersions: number;
    rejectedVersions: number;
    deployedVersions: number;
    approvedNotDeployedVersions: number;
    monthlyDeployments: MonthlyData[];
  };
  selectedYear: number;
  onYearChange: (year: number) => void;
}