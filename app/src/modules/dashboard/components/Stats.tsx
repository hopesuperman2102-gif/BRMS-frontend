import StatCard from '@/modules/dashboard/components/StatCard';
import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined';
import RuleOutlined from '@mui/icons-material/RuleOutlined';
import ToggleOnSharp from '@mui/icons-material/ToggleOnSharp';
import PendingActionsRounded from '@mui/icons-material/PendingActionsRounded';
import { StatsProps } from '@/modules/dashboard/types/dashboardTypes';
import { brmsTheme } from '@/core/theme/brmsTheme';

const Stats = ({ totalActiveProjects, totalRules, activeRules, pendingRules }: StatsProps) => {
  const stats = [
    {
      title: 'Total Projects',
      value: totalActiveProjects,
      subtitle: 'In Fleet',
      icon: AccountTreeOutlined,
      gradient: `linear-gradient(135deg, ${brmsTheme.colors.primary} 20%, ${brmsTheme.colors.primaryDark} 100%)`,
    },
    {
      title: 'Total Rules',
      value: totalRules,
      subtitle: 'Ongoing',
      icon: RuleOutlined,
      gradient: `linear-gradient(135deg, ${brmsTheme.colors.info} 20%, ${brmsTheme.colors.chartBlue1} 100%)`,
    },
    {
      title: 'Active Rules',
      value: activeRules,
      subtitle: 'Running Now',
      icon: ToggleOnSharp,
      gradient: `linear-gradient(135deg, ${brmsTheme.colors.chartGreen} 20%, ${brmsTheme.colors.success} 100%)`,
    },
    {
      title: 'Pending Rules',
      value: pendingRules,
      subtitle: 'In Queue',
      icon: PendingActionsRounded,
      gradient: `linear-gradient(135deg, ${brmsTheme.colors.warning} 20%, ${brmsTheme.colors.chartOrange} 100%)`,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '24px',
      }}
    >
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
};

export default Stats;