import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { RcCard } from 'app/src/core/components/RcCard';


const DashboardHeader = () => {
  return (
    <RcCard sx={{ mb: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: brmsTheme.colors.textPrimary,
              margin: 0,
            }}
          >
            BRMS Dashboard
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: brmsTheme.colors.textSecondary,
              margin: '4px 0 0 0',
            }}
          >
            Real-time monitoring
          </p>
        </div>

        <button
          style={{
            padding: '12px 24px',
            background: 'white',
            border: `2px solid ${brmsTheme.gradients.primary}`,
            borderRadius: '8px',
            color: brmsTheme.gradients.primaryHover,
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Hub
        </button>
      </div>
    </RcCard>
  );
};

export default DashboardHeader;
