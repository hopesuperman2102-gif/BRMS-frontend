import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import StatCard from '@/modules/dashboard/components/StatCard';
import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined';
import RuleOutlined from '@mui/icons-material/RuleOutlined';
import ToggleOnSharp from '@mui/icons-material/ToggleOnSharp';
import PendingActionsRounded from '@mui/icons-material/PendingActionsRounded';
import { StatsProps } from '@/modules/dashboard/types/dashboardTypes';
import { brmsTheme } from '@/core/theme/brmsTheme';

const { colors } = brmsTheme;

// ─── Styled Components ────────────────────────────────────────────────────────

const GridWrapper = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '24px',
  marginBottom: '24px',
});

// ─── Component ────────────────────────────────────────────────────────────────

const Stats = ({ totalActiveProjects, totalRules, activeRules, pendingRules }: StatsProps) => {
  const stats = [
    {
      title: 'Total Projects',
      value: totalActiveProjects,
      subtitle: 'In Fleet',
      icon: AccountTreeOutlined,
      gradient: `linear-gradient(135deg, ${colors.primary} 20%, ${colors.primaryDark} 100%)`,
    },
    {
      title: 'Total Rules',
      value: totalRules,
      subtitle: 'Ongoing',
      icon: RuleOutlined,
      gradient: `linear-gradient(135deg, ${colors.info} 20%, ${colors.chartBlue1} 100%)`,
    },
    {
      title: 'Active Rules',
      value: activeRules,
      subtitle: 'Running Now',
      icon: ToggleOnSharp,
      gradient: `linear-gradient(135deg, ${colors.chartGreen} 20%, ${colors.success} 100%)`,
    },
    {
      title: 'Pending Rules',
      value: pendingRules,
      subtitle: 'In Queue',
      icon: PendingActionsRounded,
      gradient: `linear-gradient(135deg, ${colors.warning} 20%, ${colors.chartOrange} 100%)`,
    },
  ];

  return (
    <GridWrapper>
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </GridWrapper>
  );
};

export default Stats;