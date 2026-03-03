import { MonthlyData } from "@/modules/dashboard/types/dashboardEnpointsTypes";

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
