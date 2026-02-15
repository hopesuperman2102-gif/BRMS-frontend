import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardHeader from "../components/DashboardHeader";
import DeployedRulesChart from "../components/DeployedRulesChart";
import RulesCreatedChart from "../components/RulesCreatedChart";
import StatsSection from "../components/Stats";
import { verticalsApi } from '../../vertical/api/verticalsApi';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { verticalId } = useParams();
  const [verticalName, setVerticalName] = useState<string>('');

  useEffect(() => {
    if (!verticalId) return;

    const fetchVerticalName = async () => {
      try {
        const verticals = await verticalsApi.getVerticalsView();
        const vertical = verticals.find((v) => String(v.id) === verticalId);
        if (vertical) {
          setVerticalName(vertical.vertical_name);
        }
      } catch (error) {
        console.error('Error fetching vertical:', error);
      }
    };

    fetchVerticalName();
  }, [verticalId]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        padding: '15px',
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Back Button and Vertical Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <IconButton
            onClick={() => navigate('/vertical')}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: 'rgba(101, 82, 208, 0.08)',
              color: '#6552D0',
              transition: 'all 0.2s',
              flexShrink: 0,
              '&:hover': {
                backgroundColor: 'rgba(101, 82, 208, 0.15)',
                transform: 'translateX(-2px)',
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {verticalName && (
            <Typography
              sx={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#374151',
                whiteSpace: 'nowrap',
              }}
            >
              {verticalName}
            </Typography>
          )}
        </Box>

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