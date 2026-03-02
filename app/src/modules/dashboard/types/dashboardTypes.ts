//StatCard Props
export interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ElementType;
  gradient: string;
}

//deployed rules chart types
export interface DeployedRuleProps {
  data: MonthlyData[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

//Rules created chart types
export interface RulesCreatedChartProps {
  data: MonthlyData[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  height?: number;
}

// Stats component types
export interface StatsProps {
  totalActiveProjects: number;
  totalRules: number;
  activeRules: number;
  pendingRules: number;
}

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
