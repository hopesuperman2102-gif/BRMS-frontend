import DashboardHeader from "../components/DashboardHeader";
import DeployedRulesChart from "../components/DeployedRulesChart";
import RulesCreatedChart from "../components/RulesCreatedChart";
import StatsSection from "../components/Stats";


const DashboardPage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        padding: '32px',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <DashboardHeader />
        <StatsSection />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          <RulesCreatedChart />
          <DeployedRulesChart />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
