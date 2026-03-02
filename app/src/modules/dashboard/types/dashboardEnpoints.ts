// Dashboard api types
export interface MonthlyData {
  year: number;
  month: number;
  total: number;
}

export interface DashboardSummary {
  vertical_key: string;
  vertical_name: string;
  total_active_projects: number;
  total_rules: number;
  active_rules: number;
  pending_rules: number;
  monthly_rule_creations: MonthlyData[];
  monthly_deployments: MonthlyData[];
}
