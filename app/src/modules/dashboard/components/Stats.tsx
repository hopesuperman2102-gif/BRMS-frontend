import StatCard from './StatCard';

const Stats = () => {
  const stats = [
    {
      title: 'Total Projects',
      value: '248',
      subtitle: 'In Fleet',
      trend: '+12%',
      trendUp: true,
      icon: '∑📂',
      gradient: 'linear-gradient(135deg, #6552D0 20%, #17203D 100%)',
    },
    {
      title: 'Total Rules',
      value: '121',
      subtitle: 'Ongoing',
      trend: '+8%',
      trendUp: true,
      icon: '∑📜',
      gradient: 'linear-gradient(135deg, #1976d2 20%, #0d47a1 100%)',
    },
    {
      title: 'Active Rules',
      value: '87',
      subtitle: 'Running Now',
      trend: '+5%',
      trendUp: true,
      icon: '🚀',
      gradient: 'linear-gradient(135deg, #2e7d32 20%, #1b5e20 100%)',
    },
    {
      title: 'Pending Rules',
      value: '34',
      subtitle: 'In Queue',
      trend: '-3%',
      trendUp: false,
      icon: '⏳',
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
