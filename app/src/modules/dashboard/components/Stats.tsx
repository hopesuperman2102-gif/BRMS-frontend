import StatCard from './StatCard';
import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined';
import RuleOutlined from '@mui/icons-material/RuleOutlined';
import ToggleOnSharp from '@mui/icons-material/ToggleOnSharp';
import PendingActionsRounded from '@mui/icons-material/PendingActionsRounded';

interface Props {
  totalActiveProjects: number;
  totalRules: number;
  activeRules: number;
  pendingRules: number;
}

const Stats = ({ totalActiveProjects, totalRules, activeRules, pendingRules }: Props) => {
  const stats = [
    {
      title: 'Total Projects',
      value: totalActiveProjects,
      subtitle: 'In Fleet',
      icon: AccountTreeOutlined,
      gradient: 'linear-gradient(135deg, #6552D0 20%, #17203D 100%)',
    },
    {
      title: 'Total Rules',
      value: totalRules,
      subtitle: 'Ongoing',
      icon: RuleOutlined,
      gradient: 'linear-gradient(135deg, #1976d2 20%, #0d47a1 100%)',
    },
    {
      title: 'Active Rules',
      value: activeRules,
      subtitle: 'Running Now',
      icon: ToggleOnSharp,
      gradient: 'linear-gradient(135deg, #2e7d32 20%, #1b5e20 100%)',
    },
    {
      title: 'Pending Rules',
      value: pendingRules,
      subtitle: 'In Queue',
      icon: PendingActionsRounded,
      gradient: 'linear-gradient(135deg, #ed6c02 20%, #c77700 100%)',
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