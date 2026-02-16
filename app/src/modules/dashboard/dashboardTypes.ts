
export interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ElementType;
  gradient: string;
}